<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        return Product::query()->latest()->paginate();
    }

    public function store(ProductRequest $request)
    {
        $product = Product::create($request->validated());

        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function update(ProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        if ($product->orderItems()->exists()) {
            return response()->json([
                'message' => 'This product has order history and cannot be deleted. Deactivate it instead.',
            ], 409);
        }

        $product->delete();

        return response()->noContent();
    }
}
