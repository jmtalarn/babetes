;(function() {
  var Socializer = {
    init: function() {
      this.page_url = window.location.href;
      this.page_title = "\"" + $('.post-title').html() + "\"";
      this.blog_logo = $('.logo').attr('src');
      this.post_content = $('.post-content').html();
      this.twitter();
      this.facebook();
      this.googleplus();
      this.emailit();
    },
    twitter: function() {
      this.message = encodeURIComponent(this.page_title + " " + this.page_url);
      this.intent_url = "https://twitter.com/intent/tweet?text=" + this.message;
      $('.js-twitter').attr({
        'href': this.intent_url
      });
    },
    facebook: function() {
      this.message = encodeURIComponent(this.page_url);
      this.intent_url = "https://www.facebook.com/sharer/sharer.php?u=" + this.message;
      $('.js-facebook').attr({
        'href': this.intent_url
      });
    },
    googleplus: function() {
      this.message = encodeURIComponent(this.page_url);
      this.intent_url = "https://plus.google.com/share?url=" + this.message;
      $('.js-googleplus').attr({
        'href': this.intent_url
      });
    },
    emailit: function() {
      this.message = encodeURIComponent("<h2>" + this.page_title + "</h2><h3>" + this.page_url + "</h3>" + this.post_content);
      this.intent_url = "mailto:?to=&subject=" + this.page_title + "&body=" + this.message;
      $('.js-email').attr({
        'href': this.intent_url
      });
    },
  };
  Socializer.init();
})();
