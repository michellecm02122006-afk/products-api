import express from "express";
import routes from "./routes";

export class Server {
  private app: any;
  private port: any;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.middlewares();
    this.routes();
  }

  private middlewares(): any {
    this.app.use(express.json());
  }

  private routes(): any {
    this.app.use("/api/v1", routes);
    this.app.use((_req: any, res: any) => {
      res.status(404).json({ ok: false, message: "Ruta no encontrada" });
    });
    // JSON mal formado u otros errores no controlados
    this.app.use((err: any, _req: any, res: any, _next: any) => {
      if (err?.type === "entity.parse.failed") {
        return res.status(400).json({ ok: false, message: "JSON inválido en el cuerpo" });
      }
      console.error("Error no controlado:", err?.message);
      res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });
  }

  public listen(): any {
    this.app.listen(this.port, () => {
      console.log(`Servidor escuchando en http://localhost:${this.port}`);
    });
  }
}
