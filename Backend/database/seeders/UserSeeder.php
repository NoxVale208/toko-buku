<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'tokoadmin',
            'email' => 'tokoadmin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'tokokasir',
            'email' => 'tokokasir@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'kasir',
        ]);

         User::create([
            'name' => 'Customer',
            'email' => 'customer@tokobuku.test',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);
    }
}