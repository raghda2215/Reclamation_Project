<?php
namespace App\Http\Controllers;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index()
    {
        try {
            $clients = Client::all();
            return response()->json($clients, 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la récupération des clients: {$e->getMessage()}", 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $client = new Client([
                'nom' => $request->input('nom'),
                'email' => $request->input('email'),
                'telephone' => $request->input('telephone'),
                'adresse' => $request->input('adresse'),
            ]);
            $client->save();
            return response()->json($client, 201);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la création du client: {$e->getMessage()}", 500);
        }
    }

    public function show($id)
    {
        try {
            $client = Client::findOrFail($id);
            return response()->json($client, 200);
        } catch (\Exception $e) {
            return response()->json("Client non trouvé: {$e->getMessage()}", 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $client = Client::findOrFail($id);
            $client->update($request->all());
            return response()->json($client, 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la mise à jour du client: {$e->getMessage()}", 500);
        }
    }

    public function destroy($id)
    {
        try {
            $client = Client::findOrFail($id);
            $client->delete();
            return response()->json("Client supprimé avec succès", 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la suppression du client: {$e->getMessage()}", 500);
        }
    }
}