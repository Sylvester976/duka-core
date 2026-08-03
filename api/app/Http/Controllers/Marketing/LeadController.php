<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Mail\LeadSubmitted;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class LeadController extends Controller
{
    public function store(StoreLeadRequest $request)
    {
        $lead = Lead::create($request->validated());

        $adminEmails = User::query()->where('role', 'platform_admin')->pluck('email');

        if ($adminEmails->isNotEmpty()) {
            Mail::to($adminEmails->all())->send(new LeadSubmitted($lead));
        }

        return response()->json($lead, 201);
    }
}
