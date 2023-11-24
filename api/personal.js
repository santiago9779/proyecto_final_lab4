import express from "express";
import bcrypt from "bcryptjs";
import { db } from "./db.js";
import { body, param, validationResult } from "express-validator";


export const personalRouter = express
  .Router()

  .post(
    "/",
    body("nombre").isAlpha().isLength({min:4,max:20}),
    body("rol").isAlpha().isLength({min:4,max:20}),
    body("usuario").isAlphanumeric().isLength({ min: 1, max: 25 }),
    body("password").isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    }),
    
    async (req, res) => {
      const validacion = validationResult(req);
      if (!validacion.isEmpty()) {
        res.status(400).send({ errors: validacion.array() });
        return;
      }
      const {nombre, rol, usuario, password } = req.body;
      const passwordHashed = await bcrypt.hash(password, 8);
      await db.query(
        "INSERT INTO personal (nombre,rol,usuario,password) VALUES (:nombre,:rol,:usuario,:password)",
        { nombre,rol,usuario,password: passwordHashed }
      );
      res.status(201).send({nombre,rol});
    }
  )

//todos los usuarios

  .get("/", async (req, res) => {
    const [rows, fields] = await db.execute(
      "SELECT id, nombre, rol, usuario, password FROM personal"
    );
    res.send(rows);
  })


//usuario por id funciona...

  .get("/:id",
  param("id").isInt({min:1}),
   async (req, res) => {
    const { id } = req.params;
    const [rows, fields] = await db.execute(
      "SELECT id, usuario, password, rol FROM personal WHERE id = :id",
      { id }
    );
    if (rows.length > 0) {
      res.send(rows[0]);
    } else {
      res.status(404).send({ mensaje: "ususario no encontrado" });
    }
  })

//modificar usuario

  .put('/:id',async(req,res)=>{
    const {id} = req.params;
    const {nombre,rol, usuario, password} = req.body;
    const personal = {nombre,rol, usuario, password} 
    await db.query("UPDATE personal SET ? WHERE id = ?",[personal, id]);
    res.send({id,nombre,rol, usuario, password})
  })

//eliminar usuario, no funciona, problema con configuracion de foreing key

/*
  .delete("/:id", param("id").isInt({ min: 1, max:2 }), async (req, res) => {
    const { id } = req.params;
    await db.execute("DELETE FROM personal WHERE id = :id", { id });
    res.send("ok");

  })

*/
  
  
;