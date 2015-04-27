<?php

namespace Nogo\Budget\Model;

use Illuminate\Database\Eloquent\Model;

/**
 * Budget
 *
 * @author Danilo Kuehn <dk@nogo-software.de>
 */
class Budget extends Model
{
    protected $table = 'budget';

    protected $fillable = ['category_id', 'type', 'date', 'amount', 'special', 'description'];

    protected $guarded = ['id'];

    public $timestamps = false;

    public function scopeThisMonth($query)
    {
        return $query->where('votes', '>', 100);
    }
}
