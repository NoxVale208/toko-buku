<?php

namespace App\Services;

use App\Models\ActivityLog;


class ActivityLogService
{

    public static function create(
        $user,
        $action,
        $table,
        $id,
        $description
    )
    {

        ActivityLog::create([

            'user_id'=>$user->id,

            'action'=>$action,

            'table_name'=>$table,

            'record_id'=>$id,

            'description'=>$description

        ]);

    }

}