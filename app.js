const express = require("express")
const multer = require("multer")
const sqlite3 = require("sqlite3").verbose()
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 3000

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

/* AUTO CREATE UPLOAD FOLDER */
const uploadDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}
app.use("/uploads", express.static(uploadDir))

/* DATABASE */
const db = new sqlite3.Database("database.db")
db.run(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price INTEGER,
  discount INTEGER,
  image TEXT
)
`)

/* UPLOAD */
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage })

/* HOME */
app.get("/", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    res.render("index", { products: rows })
  })
})

/* ADMIN */
app.get("/Admin", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    res.render("admin", { products: rows })
  })
})

app.post("/add", upload.single("image"), (req, res) => {
  const { name, price, discount } = req.body
  const image = req.file ? req.file.filename : ""
  db.run(
    "INSERT INTO products (name, price, discount, image) VALUES (?,?,?,?)",
    [name, price, discount, image]
  )
  res.redirect("/Admin")
})

app.post("/delete/:id", (req, res) => {
  db.run("DELETE FROM products WHERE id=?", [req.params.id])
  res.redirect("/Admin")
})

app.listen(PORT, () => console.log("Server jalan di port " + PORT))
