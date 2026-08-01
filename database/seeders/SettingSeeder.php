<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::create([
            'nama_toko' => 'Toko Buku',
            'logo' => null,
            'telepon' => '081234567890',
            'email' => 'tokoadmin@gmail.com',
            'alamat' => 'Indonesia',
        ]);
    }
}