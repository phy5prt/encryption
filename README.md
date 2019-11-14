# encryption
The secrets website allows you to register and then anonymously post secrets readable by all users.
Whilst making the website I went through several iterations with increasing levels of encryption in order to learn them.


I made the website using increasingly effective forms of encryption. 
By looking at the commented out code you can see the approaches to encryption I used.

Using environment variables with .env files with git ignore to hold api keys
Hashing
Hashing and salting
Hashing, salting and peppering
BCrypt for databases
Using npm passport and express session for login sessions using cookies
OAuth


The web app was made with node.js hosted on heroku.
It is updated with github and .env for the api keys.
The database is hosted on mongo atlas and utilises AWS. 
