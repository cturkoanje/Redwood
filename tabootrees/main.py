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

class Player(db.Model):
    user = db.UserProperty()
    name = db.StringProperty(required=False)
    role = db.StringProperty(required=False)
    userObject = db.UserProperty()
    score = db.IntegerProperty(required=False, default=0)
    avatar = db.StringProperty(default=None)
    team = db.ReferenceProperty(default=None)
    teamName = db.StringProperty()
   

class Team(db.Model):
    teamName  = db.StringProperty(required=False) 
    leader = db.ReferenceProperty(Player, required=False)
    score = db.IntegerProperty(required=False)

def gql_json_parser(query_obj):
        result = []
        for entry in query_obj:
            result.append(dict([(p, unicode(getattr(entry, p))) for p in entry.properties()]))
        return result

# CLIENT_SECRETS, name of a file containing the OAuth 2.0 information for this
# application, including client_id and client_secret, which are found
# on the API Access tab on the Google APIs
# Console <http://code.google.com/apis/console>
CLIENT_SECRETS = os.path.join(os.path.dirname(__file__), 'client_secrets.json')


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
                'STATE': 'SJAOE3GGWDPOLNW9SWCXCXYJWAIJZT0D'
                }
        path = os.path.join(os.path.dirname(__file__), 'resources/templates/test.html')

        # path2 = os.path.join(os.path.dirname(__file__), 'resources/templates/test.html')
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

class GetSelf(webapp2.RequestHandler):
    def get(self):
        ava = self.request.get('avatar')
        # logging.error(ava)
        # playa = db.GqlQuery("SELECT * FROM Player WHERE avatar = :1",ava).get()
        playa = db.GqlQuery("SELECT * FROM Player WHERE avatar = :1",ava).get()
        # logging.warning(playa.name)
        # logging.warning("playa:::" + playa.role)
        jata = []
        if playa == None:
            logging.error("DAFUCK? No User???")
        else:
            jata.append(playa.role)
            jata.append(playa.teamName)
            jata.append(playa.name)
        # jata = ["HI"]
        logging.error(str(jata))
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(jata))


class GetPlayers(webapp2.RequestHandler):
    def get(self):
        allplayers = Player.all().order('teamName')
        jata = []
        for playa in allplayers:
            jata2 = []
            jata2.append(playa.name)
            jata2.append(playa.avatar) 
            jata2.append(playa.role)            
            jata2.append(playa.teamName)
            jata.append(jata2)   

            # logging.warning(playa.avatar)
            # logging.error("   ")
        # json_query_data = gql_json_parser(allplayers)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(jata))

        # self.response.out.write(simplejson.dumps(some_datastore_entity.to_dict()))
        
        # output = {
        #     'STATE': STATE
        #     }
        # path = os.path.join(os.path.dirname(__file__), 'resources/templates/test1.html')
        # self.response.headers['Content-Type'] = 'application/json'   
        # obj = {
        #     'success': 'some var', 
        #     'payload': 'some var',
        #   } 
        # jata = gql_json_parser(allplayers)
        # self.response.out.write(json.dumps(jata))
        # path2 = os.path.join(os.path.dirname(__file__), 'resources/templates/test.html')
        # self.response.write(template.render(path, output))


class Update(webapp2.RequestHandler):
    def post(self):
        #generic class for updating existing data
        info = json.loads(self.request.body)
        logging.debug(info)
        role = info['role']
        avatar = info['avatar']
        team = info['team']
        players = Player.gql("WHERE avatar= :1",avatar).get()
        # players = db.GqlQuery("SELECT * FROM Player WHERE avatar = :1",avatar).get()
        logging.error("yarrr")
        logging.warning(players)
        if players == None:
            logging.error("DAFUCK? No User???")
        else:
            logging.error(players.avatar)
            logging.error(players.role)
            logging.error(players.team)
            name = players.name
            ava = players.avatar
            logging.error(name)
            # if (role != ''):
            players.role = role
            # if (team != ''):
            players.teamName = team
            logging.warning("updating team or role")
            players.put()

class AddUser(webapp2.RequestHandler):
    def post(self):
        info = json.loads(self.request.body)
        logging.debug(info)
        url = info['avatar']
        name = info['name']
        role = info['role']
        team = info['team']
        avatar = info['avatar']
        team = "The Stinky hippies"

        players = db.GqlQuery("SELECT * FROM Player WHERE avatar = :1",url).get()
        logging.error("yarrr")
        logging.warning(players)
        if players == None:
            playa = Player()
            playa.name = name
            playa.role = role
            # playa.team = team
            playa.avatar = avatar
            playa.put()

       



config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'my-super-secret-key',
}

app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/connect', Connect),
    ('/adduser', AddUser),
    ('/update', Update),
    ('/getplayers', GetPlayers),
    ('/getself', GetSelf),
    ('/people', People)
], debug=True, config=config)



