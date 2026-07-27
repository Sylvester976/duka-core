<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * A real bcrypt hash with no matching password, so a login attempt for an
     * unknown email still pays the cost of Hash::check() instead of failing
     * instantly — otherwise response timing would leak which emails exist.
     */
    private const DUMMY_HASH = '$2y$12$ZJdmItBfHZ/5bhCvJOipce/864zB.AbK4vukF4USTUb.kQ3t/8QT.';

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        // Hash::check always runs, even for an unknown email, so a missing
        // user and a wrong password take the same amount of time to reject —
        // otherwise the response timing would leak which emails are registered.
        $validPassword = Hash::check($credentials['password'], $user->password ?? self::DUMMY_HASH);

        if (! $user || ! $validPassword) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        return response()->json([
            'token' => $user->createToken('dashboard')->plainTextToken,
            'user' => $this->userPayload($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    public function me(Request $request)
    {
        return response()->json($this->userPayload($request->user()));
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'tenant_id' => $user->tenant_id,
        ];
    }
}
