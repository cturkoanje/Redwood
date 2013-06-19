#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# if ( inputString.indexOf( "bin" ) > -1 ) {
#main inspiration:
# https://github.com/googleplus/gplus-quickstart-python/blob/master/signin.py

import webapp2
import cgi
import os
import json
import random
import string
import sys
sys.path.insert(0, 'libs')
import httplib2
from apiclient import discovery
from apiclient.errors import HttpError
from apiclient.discovery import build
from oauth2client import appengine
from oauth2client import client
from oauth2client.anyjson import simplejson
from oauth2client.client import AccessTokenRefreshError
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError

from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext.webapp import template
from google.appengine.api import memcache
from google.appengine.ext import db, webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from webapp2_extras import sessions

# class BaseHandler(webapp2.RequestHandler):
    


class User(db.Model):
    user = db.UserProperty()
    name = db.StringProperty(required=True)
    userObject = db.UserProperty()
    score = db.IntegerProperty(required=True)
    avatar = db.BlobProperty(default=None)
    past_view_count = db.IntegerProperty(default=0) # just for demo purposes ...


class Team(db.Model):
    name  = db.StringProperty(required=True) 
    leader = db.ReferenceProperty(User, required=True)
    score = db.IntegerProperty(required=True)



# CLIENT_SECRETS, name of a file containing the OAuth 2.0 information for this
# application, including client_id and client_secret, which are found
# on the API Access tab on the Google APIs
# Console <http://code.google.com/apis/console>
CLIENT_SECRETS = os.path.join(os.path.dirname(__file__), 'client_secrets.json')

# Helpful message to display in the browser if the CLIENT_SECRETS file
# is missing.
MISSING_CLIENT_SECRETS_MESSAGE = """
<h1>Warning: Please configure OAuth 2.0</h1>
<p>
To make this sample run you will need to populate the client_secrets.json file
found at:
</p>
<p>
<code>%s</code>.
</p>
<p>with information found on the <a
href="https://code.google.com/apis/console">APIs Console</a>.
</p>
""" % CLIENT_SECRETS


http = httplib2.Http(memcache)
service = discovery.build("plus", "v1", http=http)
decorator = appengine.oauth2decorator_from_clientsecrets(
    CLIENT_SECRETS,
    scope='https://www.googleapis.com/auth/plus.me',
    message=MISSING_CLIENT_SECRETS_MESSAGE)


# Create a state token to prevent request forgery.
# Store it in the session for later validation.
# state = 

# Set the Client ID, Token State, and Application Name in the HTML while
# # serving it.
# response = make_response(
#   render_template('index.html',
#                   CLIENT_ID=CLIENT_ID,
#                   STATE=state,
#                   APPLICATION_NAME=APPLICATION_NAME))

class MainHandler(webapp2.RequestHandler):
    def dispatch(self):
        # Get a session store for this request.
        # self.session['state'] = ''.join(random.choice(string.ascii_uppercase + string.digits)
              # for x in xrange(32))
        self.session_store = sessions.get_store(request=self.request)
        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        # Returns a session using the default cookie key.
        return self.session_store.get_session()

    def get(self):

        # self.response.write('Hello world!')
         # """Initialize a session for the current user, and render index.html."""
        # Create a state token to prevent request forgery.
        # Store it in the session for later validation.
        # state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                      # for x in xrange(32))
        # session['state'] = state
        # Set the Client ID, Token State, and Application Name in the HTML while
        # serving it.
        # response = make_response(
          # render_template('index.html',
                          # CLIENT_ID=CLIENT_ID,
                          # STATE=state,
                          # APPLICATION_NAME=APPLICATION_NAME))
        # return response
        quarterlist = "test"
        output = {
                'url': users.create_login_url("/login_response"),
                'quarterlist': quarterlist
                }
        path = os.path.join(os.path.dirname(__file__), 'resources/templates/index.html')
        self.response.write(template.render(path, output))
        # self.response.write(str(self.session_store))

class Connect(webapp2.RequestHandler):
    def post(self):
        code = self.request.get('data')
        try:
            # Upgrade the authorization code into a credentials object
            oauth_flow = flow_from_clientsecrets('client_secrets.json', scope='')
            oauth_flow.redirect_uri = 'postmessage'
            credentials = oauth_flow.step2_exchange(code)
        except FlowExchangeError:
            # response = make_response(
                # json.dumps('Failed to upgrade the authorization code.'), 401)
            # response.headers['Content-Type'] = 'application/json'
            # return response
            return
        gplus_id = credentials.id_token['sub']

        stored_credentials = self.session.get('credentials')
        stored_gplus_id = self.session.get('gplus_id')
        if stored_credentials is not None and gplus_id == stored_gplus_id:
            response = make_response(json.dumps('Current user is already connected.'),
                                 200)
            response.headers['Content-Type'] = 'application/json'
            return response
        # Store the access token in the session for later use.
        self.session['credentials'] = credentials
        self.session['gplus_id'] = gplus_id
        response = make_response(json.dumps('Successfully connected user.', 200))
        response.headers['Content-Type'] = 'application/json'
        return response

class People(webapp2.RequestHandler):
    def get(self):
        credentials = self.session.get('credentials')
  # Only fetch a list of people for connected users.
        if credentials is None:
            response = make_response(json.dumps('Current user not connected.'), 401)
            response.headers['Content-Type'] = 'application/json'
            return response
        try:
            # Create a new authorized API client.
            http = httplib2.Http()
            http = credentials.authorize(http)
            # Get a list of people that this user has shared with this app.
            google_request = SERVICE.people().list(userId='me', collection='visible')
            result = google_request.execute(http=http)

            response = make_response(json.dumps(result), 200)
            response.headers['Content-Type'] = 'application/json'
            return response
        except AccessTokenRefreshError:
            response = make_response(json.dumps('Failed to refresh access token.'), 500)
            response.headers['Content-Type'] = 'application/json'
            return response

config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'my-super-secret-key',
}

app = webapp2.WSGIApplication([
    ('/', MainHandler),('/connect', Connect),('/people', People)
], debug=True, config=config)



