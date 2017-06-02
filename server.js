const expess = require('express');
//start new app
const app = expess();

app.use(expess.static('dist'));

app.listen(3000, function () {
	console.log('App started on localhost:3000')
});