<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ImageUpload;
use App\Models\FileUpload;

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

    public function delete_file($id)
    {
        $fileUpload = FileUpload::find($id);
        if (!$fileUpload) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo no encontrado',
            ], 404);
        }
    
        $fileName = $fileUpload->file;
    
        $filePath = public_path('files/uploads/' . $fileName);
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    
        $fileUpload->delete();
    
        return response()->json([
            'success' => true,
            'message' => 'Archivo eliminado con éxito',
        ]);
    }
    
    public function store_file(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|mimes:pdf,doc,docx',
        ]);
    
        $fileName = '';
        if ($file = $request->file('file')) {
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            
            do {
                $uniqueId = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
                $fileName = $originalName . '-' . $uniqueId . '.' . $extension;
            } while (FileUpload::where('file', $fileName)->exists());
            
            $file->move('files/uploads', $fileName);
        }
    
        $fileUpload = FileUpload::create([
            'file' => $fileName,
        ]);
    
        return response()->json([
            'success' => true,
            'message' => 'Archivo subido con éxito',
            'file' => $fileName,
            'id' => $fileUpload->id,
        ]);
    }
}