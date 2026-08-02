<?php

namespace App\Observers;

use App\Models\Book;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class BookObserver
{
    public function created(Book $book)
    {
        if(Auth::check()){

            ActivityLog::create([
                'user_id'=>Auth::id(),
                'action'=>'create',
                'table_name'=>'books',
                'record_id'=>$book->id,
                'description'=>'Menambahkan buku '.$book->judul
            ]);

        }
    }


    public function updated(Book $book)
    {
        if(Auth::check()){

            ActivityLog::create([
                'user_id'=>Auth::id(),
                'action'=>'update',
                'table_name'=>'books',
                'record_id'=>$book->id,
                'description'=>'Mengubah buku '.$book->judul
            ]);

        }
    }


    public function deleted(Book $book)
    {
        if(Auth::check()){

            ActivityLog::create([
                'user_id'=>Auth::id(),
                'action'=>'delete',
                'table_name'=>'books',
                'record_id'=>$book->id,
                'description'=>'Menghapus buku '.$book->judul
            ]);

        }
    }
}