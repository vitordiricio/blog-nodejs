//Carregando módulos
const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const passport = require("passport")
require("./config/auth")(passport)

const app = express()
const admin = require("./routes/admin")
const usuarios = require("./routes/usuario")

const path = require("path")
const { response } = require("express")

//Configurando modulos
app.use(session({
	secret: "cursodenode",
	resave: true,
	saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success_msg")
	res.locals.error_msg = req.flash("error_msg")
	res.locals.error = req.flash("error")
	next()
})


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp", {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => {
	console.log("Conectado em mongo")
}).catch((error) => {
	console.log("Erro ao se conectar" + error)
})

//dizendo para o express que os arquivos estaticos estao na pasta 'public'
app.use(express.static(path.join(__dirname, "public")))

//Rotas
app.get("/", (req, res) => {
	Postagem.find().lean().populate("categoria").sort({data: 'desc'}).then((postagens) => {
		res.render("index", {postagens: postagens})
	}).catch((error) => {
		req.flash("error_msg", "Houve um erro interno.")
		res.redirect("/404")
	})	
})

app.get("/postagem/:id", (req, res) => {
	Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
		if(postagem){
			res.render("postagem/index", {postagem: postagem})
		} else{
			req.flash("error_msg", "Esta postagem não existe")
			res.redirect("/")
		}
	}).catch((error) => {
		req.flash("error_msg", "Houve um erro interno")
	})
})

app.get("/categorias", (req, res) => {
	Categoria.find().lean().then((categorias) => {
		res.render("categorias/index", {categorias: categorias})
	}).catch((error) => {
		req.flash("error_msg", "Houve um erro interno ao listar as categorias...")
		res.redirect("/")
	})
})

app.get("/categorias/:id", (req, res) => {
	Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
		if(categoria) {
			Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
				res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
			}).catch((error) => {
				req.flash("error_msg", "Houve um erro ao listar os posts")
				res.redirect("/")
			})
		} else {
			req.flash("error_msg", "Esta categoria não existe")
			res.redirect("/")
		}
	}).catch((error) => {
		req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria.")
		res.redirect("/")
	})
})


app.get("/404", (req, res) => {
	res.send("Erro 404!")
})

app.use("/admin", admin)
app.use("/usuarios", usuarios)

//Outros
const PORT = 8081
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))