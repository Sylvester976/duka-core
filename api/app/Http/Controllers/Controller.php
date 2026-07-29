<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Apply an allow-listed ?sort=&direction= query param to a query, falling
     * back to $defaultSort/$defaultDirection when absent or not in $allowedSorts.
     */
    protected function applySort(
        Builder $query,
        Request $request,
        array $allowedSorts,
        string $defaultSort = 'created_at',
        string $defaultDirection = 'desc',
    ): Builder {
        $sort = $request->query('sort');
        $direction = $request->query('direction') === 'asc' ? 'asc' : 'desc';

        if (in_array($sort, $allowedSorts, true)) {
            return $query->orderBy($sort, $direction);
        }

        return $query->orderBy($defaultSort, $defaultDirection);
    }
}
