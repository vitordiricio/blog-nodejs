const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")

router.get("/", (req, res) => {
	res.render("admin/index")
})

router.get("/posts", (req, res) => {
	res.send("Página de posts")
})


router.get("/categorias", (req, res) => {
	Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
		res.render("admin/categorias", {categorias: categorias})
	}).catch((error) => {
		req.flash("error_msg", "Houve um erro ao listar as categorias")
		res.redirect("/admin")
	}) 
})

router.get("/categorias/add", (req, res) => {
	res.render("admin/addcategoria")
})

router.post("/categoria/nova", (req, res) => {
	
	var erros = []
	//validacao do formulario
	if (!req.body.nome || req.body.nome == undefined || req.body.nome == null) {
		erros.push({texto: "Nome inválido"})
	} else if (!req.body.slug || req.body.slug == undefined || req.body.slug == null) {
		erros.push({texto: "Slug inválido"})
	}else if(req.body.nome.length < 2) {
		erros.push({texto: "Nome da categoria muito pequeno"})
	}else if(erros.length > 0) {
		res.render("admin/addcategoria", {erros: erros})
	} else {
		const novaCategoria = {
			nome: req.body.nome,
			slug: req.body.slug		
		}
	
		new Categoria(novaCategoria).save().then(() => {
			req.flash("success_msg", "Categoria criada com sucesso")
			res.redirect("/admin/categorias")
		}).catch((error) => {
			req.flash("error_msg", "Houve um erro ao salvar a categoria")
			res.redirect("/admin")
		})
	}
	
})

router.get("/categorias/edit/:id", (req, res) => {
	Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
		res.render("admin/editcategorias", {categoria: categoria})
	}).catch((error) => {
		res.flash("error_msg", "Esta categoria não existe")
		res.redirect("/admin/categorias")
	})
})

router.post("/categorias/edit", (req, res) => {
	const itemEditado = {
		nome: req.body.nome,
		slug: req.body.slug,
		date: Date.now()
	}
	Categoria.replaceOne({_id: req.body.id}, itemEditado).then(() => {
		req.flash("success_msg", "Categoria editada com sucesso")
		res.redirect("/admin/categorias")
	}).catch((error) => {
		req.flash("error_msg", "Houve um erro ao editar a categoria")		
		res.redirect("/admin")
	})
})

router.post("/categorias/deletar", (req, res) => {
	Categoria.deleteOne({_id: req.body.id}).then(() => {
		req.flash("success_msg","Categoria deletada com sucesso")
		res.redirect("/admin/categorias")
	}).catch((error) => {
		req.flash("error_msg", "Houve um erro ao deletar a categoria")
		res.redirect("/admin/categorias")
	})
})

router.get("/postagens", (req, res) => {
	Postagem.find().lean().populate("categoria").sort({date: 'desc'}).then((postagens) => {
		res.render("admin/postagens", {postagens: postagens})
	}).catch((error) => {
		req.flash("error_msg", "Houve um erro ao listar as postagens")
		res.redirect("/admin")
	}) 	
})

router.get("/postagens/add", (req, res) => {
	Categoria.find().lean().then((categorias) => {
		res.render("admin/addpostagens", {categorias: categorias})
	}).catch((error) => {
		req.flash("error_msg", "Houve um erro ao carregar o formulário")		
		res.redirect("/admin")
	})	
})

router.post("/postagens/nova", (req, res) => {

	var erros = []

	if(req.body.categoria == "0"){
		erros.push({texto: "Categoria invalida, registre uma categoria"})
	}

	if(erros.length > 0) {
		res.render("admin/addpostagens", {erros:erros})
	} else{
		const novaPostagem = {
			titulo: req.body.titulo,
			slug: req.body.slug,
			descricao: req.body.descricao,
			conteudo: req.body.conteudo,
			categoria: req.body.categoria
		}
		new Postagem(novaPostagem).save().then(() => {
			req.flash("success_msg", "Postagem criada com sucesso!")
			res.redirect("/admin/postagens")
		}).catch((error) => {
			req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
			res.redirect("/admin/postagens")
		})
	}
})

router.get("/postagens/edit/:id", (req, res) => {
	Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
		Categoria.find().lean().then((categoria) => {
			res.render("admin/editpostagens", {postagem: postagem, categoria: categoria})
		}).catch((error) => {
			res.flash("error_msg", "Erro ao carregar categorias")
		})		
	}).catch((error) => {
		res.flash("error_msg", "Esta postagem não existe")
		res.redirect("/admin/postagens")
	})
})

router.post("/postagens/edit", (req, res) => {
	const postagemEditada = {
		titulo: req.body.titulo,
		slug: req.body.slug,
		descricao: req.body.descricao,
		conteudo: req.body.conteudo,
		categoria: req.body.categoria,
		data: Date.now()
	}
	Postagem.replaceOne({_id: req.body.id}, postagemEditada).then(() => {
		req.flash("success_msg", "Postagem editada com sucesso!")
		res.redirect("/admin/postagens")
	}).catch((error) => {
		req.flash("error_msg", "Houve um erro ao editar a postagem.")
		res.redirect("/admin/postagens")
	})
})

router.get("/postagens/deletar/:id", (req, res) => {
	Postagem.deleteOne({_id: req.params.id}).then(() => {
		req.flash("success_msg", "Postagem deletada com sucesso!")
		res.redirect("/admin/postagens")
	}).catch((error) => {
		req.flash("error_msg", "Erro ao deletar postagem.")
		res.redirect("/admin/postagens")
	})
})



module.exports = router