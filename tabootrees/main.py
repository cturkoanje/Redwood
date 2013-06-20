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
import logging
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
from oauth2client.client import Credentials
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext.webapp import template
from google.appengine.api import memcache
from google.appengine.ext import db, webapp
from google.appengine.ext.webapp.util import run_wsgi_app
# from webapp2_extras import json
from webapp2_extras import sessions

# class BaseHandler(webapp2.RequestHandler):
    
SERVICE = build('plus', 'v1')

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

# # Helpful message to display in the browser if the CLIENT_SECRETS file
# # is missing.
# MISSING_CLIENT_SECRETS_MESSAGE = """
# <h1>Warning: Please configure OAuth 2.0</h1>
# <p>
# To make this sample run you will need to populate the client_secrets.json file
# found at:
# </p>
# <p>
# <code>%s</code>.
# </p>
# <p>with information found on the <a
# href="https://code.google.com/apis/console">APIs Console</a>.
# </p>
# """ % CLIENT_SECRETS


# http = httplib2.Http(memcache)
# service = discovery.build("plus", "v1", http=http)
# decorator = appengine.oauth2decorator_from_clientsecrets(
#     CLIENT_SECRETS,
#     scope='https://www.googleapis.com/auth/plus.me',
#     message=MISSING_CLIENT_SECRETS_MESSAGE)


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

        state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                  for x in xrange(32))
        self.session['state'] = state

        output = {
                'STATE': state 
                }
        path = os.path.join(os.path.dirname(__file__), 'resources/templates/index.html')
        self.response.write(template.render(path, output))
        # self.response.write(str(self.session_store))

class Connect(webapp2.RequestHandler):
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
        self.session_store = sessions.get_store(request=self.request)
        return self.session_store.get_session()

    def post(self):
        logging.debug("DOING POST!!!!")
        state = self.request.get("state")
        code = self.request.body
        #code = (self.request.get('state'))
        logging.debug("state: "+str(self.request.get('state')))
        logging.debug("code? : "+str(code))
        #self.response.status = 200
      
        try:
            # Upgrade the authorization code into a credentials object
            
            #logging.debug('the code: ')
            #logging.debug(code)
            oauth_flow = flow_from_clientsecrets('client_secrets.json', scope='')
            #logging.debug('1... ouath_flow = flow from clientsecrets')
            oauth_flow.redirect_uri = 'postmessage'
            #logging.debug('2... ouath_flowredirect_uri')
            credentials = oauth_flow.step2_exchange(code)
            logging.debug("creds: " + str(credentials))

        except FlowExchangeError:
            self.response.headers['Content-Type'] = 'application/json'   
            obj = {
                'success': 'some var', 
                'payload': 'some var',
              } 
            self.response.status = 401
            self.response.out.write(json.dumps('Failed to upgrade the authorization code.'))
            logging.warning('except Flow Exchange Error')
            return
        self.response.headers['Content-Type'] = 'application/json'
        gplus_id = credentials.id_token['sub']

        stored_credentials = self.session.get('credentials')
        stored_gplus_id = self.session.get('gplus_id')
        if stored_credentials is not None and gplus_id == stored_gplus_id:
            
            self.response.status = 200
            self.response.out.write(json.dumps('Current user is already connected.'))
            
        self.session_store = sessions.get_store(request=self.request)
        # Store the access token in the session for later use.
        self.session['credentials'] = credentials.to_json()
        logging.debug("tits:")
        logging.debug("  ")
        logging.debug("  ")
        logging.debug("  ")
        logging.debug("  ")
        logging.debug("  ")
        logging.debug(self.session['credentials'])
        self.session['gplus_id'] = gplus_id
        
        self.response.status = 200
        self.response.out.write(json.dumps('Successfully connected user.'))
        return 

class People(webapp2.RequestHandler):

    @webapp2.cached_property
    def session(self):
        # Returns a session using the default cookie key.
        self.session_store = sessions.get_store(request=self.request)
        logging.debug(self.session_store.get_session())
        return self.session_store.get_session()

    def get(self):
        # credentials = sessions.get_store(request=self.request).get_session().get('credentials')
        credentials = self.session.get('credentials')
        credentials = Credentials.new_from_json(credentials)
        logging.debug("nawwwwww")
        logging.debug(credentials)
        # credentials = credentials[0].from_json()
        # logging.debug(credentials)
        # logging.debug("FUCK")
  # Only fetch a list of people for connected users.
        if credentials is None:
            logging.debug("creds = none!")
            self.response.headers['Content-Type'] = 'application/json'
            self.response.status = 401
            self.response.out.write(json.dumps('Current user not connected.'))
            

        try:
            # Create a new authorized API client.
            http = httplib2.Http()
            http = credentials.authorize(http)
            # Get a list of people that this user has shared with this app.
            google_request = SERVICE.people().list(userId='me', collection='visible')
            result = google_request.execute(http=http)
            logging.debug(json.dumps(result))
            self.response.headers['Content-Type'] = 'application/json'
            self.response.status = 200
            self.response.out.write(json.dumps(result))

            

        except AccessTokenRefreshError:
            self.response.headers['Content-Type'] = 'application/json'
            self.response.status = 500
            self.response.out.write(json.dumps('Failed to refresh access token.'))

# {"0":{"access_token":"ya29.AHES6ZTMnSsvn54AH4A1sDW1BfwJ8TmSDZV0o9-geLmEGbP7g1uZlw","token_type":"Bearer",
# "expires_in":"3600",
# "id_token":"eyJhbGciOiJSUzI1NiIsImtpZCI6ImVkNjM0ZWM3OTc2ZGFlMTRmZTMwY2M5M2RlNmY3ZGNhZDIwN2ZhOWQifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwic3ViIjoiMTE0MTQzNjg5ODE3NjcyOTUwNzY5IiwiYXpwIjoiMzk0ODY3ODYyNzEzLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiY19oYXNoIjoiRzd6ZjZGMnl0VHUwZWpFYkVRT2pvdyIsImF1ZCI6IjM5NDg2Nzg2MjcxMy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF0X2hhc2giOiJ5dWpfSDYzOVRBUTk2SzQ4NkJZcWVRIiwiaWF0IjoxMzcxNjg1NDQyLCJleHAiOjEzNzE2ODkzNDJ9.MqQ9jSHfAlx-iPeAQw-z1Zg56XHiLx94VSknpvVyMHoQwCexG6aYH-TtyoTAxwqqosAfEbyBtbhxhb9us-zyk5Ttaqb8l7Rb76ODYMI_DzjQd7IMHhBU_UnA9ZtaTgBrrUKK7NqbWKSupTtrUOw8MIRyBzDYZ-ANQ5RBvP2hZDc",
# "session_state":"4e4c8ae754d46eb1a5b7a5e14809158e6706f66b..7353",
# "client_id":"394867862713.apps.googleusercontent.com",
# "scope":"https://www.googleapis.com/auth/plus.login",
# "response_type":"code token id_token gsession",
# "issued_at":"1371685743","expires_at":"1371689343","_aa":"0"}}


config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'my-super-secret-key',
}

app = webapp2.WSGIApplication([
    ('/', MainHandler),('/connect', Connect),('/people', People)
], debug=True, config=config)



