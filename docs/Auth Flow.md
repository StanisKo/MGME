### Auth Flow ###
<pre>
User logs in
|
|
|
v
Access JWT with necessary claims is created
|
|
|
v
Refresh token (random base64 encoded int) is created and written to the database
Where User-to-RefreshToken is 1:N
|
|
|
v
Refresh token is written to httpOnly cookie
with expiration that equals presumed session time (8hr)

A simple session flag (sessionIsActive=true) is written to httpOnly cookie
with expiration that equals presumed session time (8hr)

JWT is returned in response body and saved by client into memory
|
|
|
v
Client receives the JWT and starts keeping track of it's expiration
Where JWT expiration is 5 minutes
|
|
|
v
4 minutes into deferred call, client requests to refresh the token
|
|
|
v
Service checks for refresh token cookie, retrieves it from the database and deletes
New refresh token is generated, assigned to current user and written to httpOnly cookie

New JWT is creared and returned in response body
|
|
|
v



</pre>