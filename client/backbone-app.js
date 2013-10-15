


var newMessage = Backbone.Model.extend({
  url: 'https://api.parse.com/1/classes/chatterbox'


});

var Message = newMessage.extend({
  // reads the message object's "objectId" attribute and saves ID as that
  idAttribute :'objectId',

  initialize: function(){
    // makes date readable
    // need to comment out since Date is now epoch time
    var date = new Date((this.get('createdAt') || "")
      .replace(/-/g,"/")
      .replace(/[TZ]/g," "))
    date = date.getMonth().toString()+'/'
      +date.getDate().toString()+ ' @ '
      +date.getHours().toString()+':'
      +date.getMinutes().toString();
    this.set('createdAt',date);
  },

  render : function(){
    return _.template('<div class ="<%- objectId %>"><%- createdAt %> -- <%- username %>: <%- text %></div>',this.attributes);
  }

});

var AllMessages = Backbone.Collection.extend({

  model: Message, // no parens because Message is a class
  url: 'https://api.parse.com/1/classes/chatterbox',
  messagesOnScreen: 15,

  initialize: function(){
    var that = this;
    this.fetchMessages();
    setInterval(function(){that.fetchMessages();},1000);
  },

  fetchMessages: function(){
    var that = this;
    this.fetch({
      // need to comment out unless we can accept limits
      data: {
        'order': '-createdAt',
        'limit': this.messagesOnScreen
      },
      success: function(model, data){
      }
    });
  },

  parse: function(response) {
    return response.results;
  }
});

var MessageViewer = Backbone.View.extend({

  initialize: function(){
    this.collection.on('remove',this.remove,this);
    this.collection.on('add',this.add,this);
    this.addCount = 0;
    this.roomname = 'lobby';

    var that = this;

    $('.inputbutton').on('click',function(){
      that.sendMessage();
    });
    $('.roombutton').on('click',function(){
      that.changeRoom();
    });

  },

  add: function(e){
    console.log('add');
    if(this.addCount < this.collection.messagesOnScreen){
      this.$el.prepend(this.collection.get(e).render());
    } else {
      this.$el.append(this.collection.get(e).render());
    }
    this.addCount++;
  },

  change: function(e){
    console.log('change');
  },

  changeRoom: function(){
    this.roomname = $('.roombox').val() || 'lobby';
    $('.roombox').val('');
  },

  merge: function(e){
    console.log('merge');
  },

  remove: function(e){
    console.log('remove');
    $('.'+e.get('objectId')).remove();
  },

  render: function(){
    this.$el.append(this.collection.models.map(function(item){
      return item.render();
    }));
  },

  sendMessage: function(){
    var model = new newMessage({
      text:$('.inputbox').val(),
      username: window.location.search.slice(window.location.search.indexOf('=')+1) || 'Guest',
      roomname: this.roomname
    });
    $('.inputbox').val('');
    model.save();
  }
});



