'use strict';
var Category = require('../models/category'); 

module.exports.addCategory = function(req, res) {
	var category = Category({
		name: req.body.name,
		description: req.body.description,
		color: req.body.color
	});

	category.save(function(err) {
		if (err) throw err;

		res.json({success: true, description: "Categoria adicionada com sucesso."});
	});
};
module.exports.updateCategory = function(req, res) {
	Category.findOne({_id : req.swagger.params.id.value}, function (err, category) {
		if(err) throw err;

		if(category){
			
			category.name = req.body.name,
			category.description = req.body.description
			category.color = req.body.color;
			category.save();

			res.json({success : true, description:"Dados editados com sucesso."});
		}else{
			res.json({success : false, description:"Erro ao editar Dados."});
		}
	});
};
module.exports.deleteCategory = function(req, res) {
	Category.remove({ _id: req.swagger.params.id.value }, function(err) {
		if (!err) {
			res.json({success : true, description:"Categoria eliminada com sucesso."});
		}
		else {
			res.json({success : false, description:"Essa categoria não existe."});
		}
	});
};
module.exports.deleteManyCategories = function(req,res){
	Category.remove({ _id: {$in: req.body.id} }, function(err) {
		if (!err) {
			res.json({success : true, description:"Categorias eliminadas com sucesso."});
		}
		else {
			res.json({success : false, description:"Ocurreu um erro"});
		}
	});
};
module.exports.deleteCategory = function(req, res) {
	Category.remove({ _id: req.swagger.params.id.value }, function(err) {
		if (!err) {
			res.json({success : true, description:"Categoria eliminada com sucesso."});
		}
		else {
			res.json({success : false, description:"Essa categoria não existe."});
		}
	});
};
module.exports.getCategories = function(req, res) {
	var result = [];

	Category.find({}, function(err, categories) {
		if (err) throw err;

		for(var i = 0; i < categories.length; i++){
			result.push(categoryToResult(categories[i]));
		}
		res.json(result);
	});
	
};
module.exports.getCategory = function(req, res) {
	
	Category.findOne({_id: req.swagger.params.id.value}, function(err, category) {
		if (err) throw err;
		if(category){
			res.json(categoryToResult(category));
		}else{
			res.status(400);
			res.json({message: "Essa categoria não existe"});
		}
		
	});
	
};

function categoryToResult(category){
	return {
		id: category._id,
		name: category.name,
		description: category.description,
		color: category.color
	}
}
