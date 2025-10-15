const mysql = require('mysql');
 
 const connection = mysql.createConnection({ 
	 host: 'localhost', 
	 database: 'shop_dandev', 
	 user: 'root', // username of the mysql connection 
	 password: '' // password of the mysql connection
});
connection.connect(function (err) {
   if(err){
       console.log('Error connecting' + err.stack );
	   return;
   }
   else{
       console.log('Connected as id' + connection.threadId);
   }
});

connection.query('SELECT * FROM customers', function(error, results, fields) {
	if(error)
		throw error;
		results.forEach(result => {
			console.log(result);
		});
});