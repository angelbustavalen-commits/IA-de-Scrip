import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname,"public")));

app.post("/api/chat", async (req,res)=>{
  try{
    const messages=Array.isArray(req.body.messages)?req.body.messages:[];
    const input=messages.slice(-20).map(m=>({
      role:m.role==="assistant"?"assistant":"user",
      content:String(m.content||"")
    }));
    const response=await client.responses.create({
      model:process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions:`Eres IA de Scrip, un asistente de programación y creación de proyectos.
Ayudas con Roblox, Free Fire, videojuegos, páginas web, JavaScript, Lua, Python y otros proyectos.
Pregunta por la plataforma cuando sea necesario. No inventes APIs o funciones específicas si no tienes suficiente información.
Cuando entregues código, explica dónde colocarlo y usa bloques de código claros.
Para mapas de juegos como Free Fire, ayuda con diseño, distribución, mecánicas y documentación; no prometas modificar directamente el juego si no existe una herramienta conectada para hacerlo.`,
      input
    });
    res.json({reply:response.output_text});
  }catch(e){
    console.error(e);
    res.status(500).json({error:"No se pudo obtener una respuesta. Revisa la API key del servidor."});
  }
});

app.listen(port,()=>console.log(`IA de Scrip en http://localhost:${port}`));
