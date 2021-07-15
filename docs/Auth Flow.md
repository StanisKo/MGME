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

User gains access to private routes inside client app
|
|
|
v
4 minutes into deferred call, or when user refreshes the page, client requests to refresh the token
|
|
|
v
Service checks for refresh token cookie, retrieves it from the database and deletes
New refresh token is generated, assigned to current user and written to httpOnly cookie

New JWT is created and returned in response body
    |
    |
    |
    v
    If token cannot be refreshed (either refresh token or session flag has expired and/or missing from cookies)
    Service returns 401
    |
    |
    |
    v
    Client treats it as end of session, logs user out and denies access to private routes
    |
    |
    |
    v
    Else if user logs out manually, current refresh token is removed from database and cookies
    Along with session flag
    Client denies access to private routes
|
|
|
v
User needs to log in

<hr/>
Even though refresh token has expiration and is removed from cookies at the same time with session flag
Refresh tokens written into the database remain

Moreover, there can be multiple of them per one user at one point in time,
Since this mechanism allows users to login from different machines

Therefore, on boot, a hosted service is initialized and every 8 hours (TODO: interval has to be reduced)
Checks for expired refresh tokens of all users and removes them
</pre>