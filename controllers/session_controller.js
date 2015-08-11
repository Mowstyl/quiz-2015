// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next){
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// GET /login   -- Formulario de login
exports.new = function(req, res) {
    var errors = req.session.errors || {};
    req.session.errors = {};

    res.render('sessions/new', {errors: errors});
};

// POST /login   -- Crear la sesión
exports.create = function(req, res) {

    var login     = req.body.login;
    var password  = req.body.password;

    var userController = require('./user_controller');
    userController.autenticar(login, password, function(error, user) {

        if (error) {  // si hay error retornamos mensajes de error de sesión
            req.session.errors = [{"message": 'Se ha producido un error: '+error}];
            res.redirect("/login");
            return;
        }

        // Crear req.session.user y guardar campos   id  y  username
        // La sesión se define por la existencia de:    req.session.user
        req.session.user = {id:user.id, username:user.username, lastaction:(new Date).getTime()};

        res.redirect(req.session.redir.toString());// redirección a path anterior a login
    });
};

// DELETE /logout   -- Destruir sesión
exports.destroy = function(req, res) {
    if (req.session.user) {
      delete req.session.user;
    }
    if (req.session.redir) {
      res.redirect(req.session.redir.toString()); // redirect a path anterior a login
    } else {
      res.redirect('/');
    }
};
