<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ImageUpload;
use App\Models\FileUpload;
use App\Models\User;
use App\Models\Empresa;
use App\Models\Estudiante;

class ImagesController extends Controller
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
        $validated = $request->validate([
            'image' => 'required|mimes:jpg,jpeg,png,bmp',
            'user_id' => 'nullable|exists:users,id', // Validar opcionalmente el user_id
            'desc' => 'nullable|string|max:255', // Validar opcionalmente el desc
        ]);
    
        $imageName = '';
        if ($image = $request->file('image')) {
            $imageName = time() . '-' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->move('images/uploads', $imageName);
        }
    
        $imageUploadData = [
            'image' => $imageName,
            'desc' => $request->input('desc', ''), // Asignar desc si se proporciona, de lo contrario, una cadena vacía
        ];
    
        // Asociar la imagen al usuario si se proporciona user_id
        if ($request->has('user_id')) {
            $user = User::find($request->input('user_id'));
            if ($user) {
                if ($user->rol === 'estudiante') {
                    $imageUploadData['estudiante_id'] = $user->id;
                } elseif ($user->rol === 'empresa') {
                    $imageUploadData['empresa_id'] = $user->id;
                }
            }
        }
    
        $imageUpload = ImageUpload::create($imageUploadData);
    
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
            'user_id' => 'nullable|exists:users,id', // Validar opcionalmente el user_id
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

        $fileUploadData = [
            'file' => $fileName,
        ];

        // Asociar el archivo al usuario si se proporciona user_id
        if ($request->has('user_id')) {
            $user = User::find($request->input('user_id'));
            if ($user) {
                if ($user->rol === 'estudiante') {
                    $fileUploadData['estudiante_id'] = $user->id;
                } elseif ($user->rol === 'empresa') {
                    $fileUploadData['empresa_id'] = $user->id;
                }
            }
        }

        $fileUpload = FileUpload::create($fileUploadData);

        return response()->json([
            'success' => true,
            'message' => 'Archivo subido con éxito',
            'file' => $fileName,
            'id' => $fileUpload->id,
        ]);
    }

    public function cambiarOrdenImg(Request $request)
    {
        $validated = $request->validate([
            'publication_id' => 'required|exists:publications,id',
            'image_orders' => 'required|array',
            'image_orders.*.image_id' => 'required|exists:image_uploads,id',
            'image_orders.*.new_order' => 'required|integer|min:1',
        ]);

        $publicationId = $request->input('publication_id');
        $imageOrders = $request->input('image_orders');

        try {
            foreach ($imageOrders as $imageOrder) {
                $imageId = $imageOrder['image_id'];
                $newOrder = $imageOrder['new_order'];
                
                // Actualizar el desc de la imagen para reflejar el nuevo orden
                $imageUpload = ImageUpload::find($imageId);
                if ($imageUpload && strpos($imageUpload->desc, 'publicationImage') === 0) {
                    // Extraer el prefijo y actualizar con el nuevo número
                    $imageUpload->desc = 'publicationImage' . $newOrder;
                    $imageUpload->save();
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Orden de imágenes actualizado con éxito',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el orden de las imágenes: ' . $e->getMessage(),
            ], 500);
        }
    }
}