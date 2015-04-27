<?php

namespace Nogo\Budget\Model;

use Illuminate\Database\Eloquent\Model;

/**
 * Budget
 *
 * @author Danilo Kuehn <dk@nogo-software.de>
 */
class Category extends Model
{
    protected $fillable = ['name', 'with_description'];

    protected $guarded = ['id'];

    public $timestamps = false;

}
