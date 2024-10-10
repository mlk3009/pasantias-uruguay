<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ImageUpload;

class ImageController extends Controller
{
    public function delete_image($id)
    {

        $imageUpload = ImageUpload::find($id);
        if (!$imageUpload) {
            return response()->json([
                'success' => false,
                'message' => 'Imagen no encontrada',
            ], 404);
        }

        $imageName = $imageUpload->image;

        $imagePath = public_path('images/uploads/' . $imageName);
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }

        $imageUpload->delete();

        return response()->json([
            'success' => true,
            'message' => 'Imagen eliminada con éxito',
        ]);
    }

    public function store_image(Request $request)
    {
        // De momento no apliqué el validated, de momento.
        $validated = $request->validate([
            'image' => 'required|mimes:jpg,jpeg,png,bmp',
        ]);

        $imageName = '';
        if ($image = $request->file('image')) {
            $imageName = time() . '-' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->move('images/uploads', $imageName);
        }

        $imageUpload = ImageUpload::create([
            'image' => $imageName,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Imagen subida con éxito',
            'image' => $imageName,
            'id' => $imageUpload->id,
        ]);
    }
}