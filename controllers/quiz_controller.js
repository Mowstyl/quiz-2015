var models = require('../models/models.js');

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: { id: Number(quizId) },
            include: [{ model: models.Comment }]
        }).then(function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId)); }
    }
  ).catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res) {
  var sch = "%";
  if (typeof req.query.search !== 'undefined') {
    sch += req.query.search.replace(/\ /g, "%") + "%";
  }
  models.Quiz.findAll({where: ["pregunta like ?", sch]}).then(
    function(quizes) {
      res.render('quizes/index', { quizes: quizes, errors: []});
    }
  ).catch(function(error) { next(error);});
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if(req.query.respuesta === req.quiz.respuesta){
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer',
    { quiz: req.quiz,
      respuesta: resultado,
      errors: []
    }
  );
};

// GET /author
exports.author = function(req, res) {
  res.render('author', {errors: []});
};

// GET /quizes/statistics
exports.stats = function(req, res) {
  models.Quiz.findAll().then(
    function(quizzes){
      var cms = { q:0, num: 0, no: 0};
      for (id in quizzes){
        cms["q"]++;
      }
      models.Comment.findAll({order: 'QuizId'}).then(
        function(Comments){
          var ids = [undefined];
          var i = 0;
          for (comm in Comments) {
            if (Comments[comm].publicado) {
              cms["num"]++;
              if (ids[i] !== Comments[comm].QuizId) {
                ids[i] = Comments[comm].QuizId;
                i++;
              }
            }
          }
          if (typeof ids[0] !== 'undefined') {
            cms["no"] = cms["q"] - ids.length;
          } else {
            cms["no"] = cms["q"];
          }
          res.render('quizes/statistics', {cms: cms, errors: []});
        }
      );
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta", tema: "Otro"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "tema"]})
        .then(function(){ res.redirect('/quizes');});
      }
    }
  );
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz; // autoload de instancia de quiz

  res.render('quizes/edit', {quiz:quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  );
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};
