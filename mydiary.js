$(function() {
	var entryTitle = $("#entry-title"),
		entryContent = $("#entry-content"),
		entryLocation = null,
		container = $("section.entries"),
		STORAGE_KEY = "diary-entry",
		key = '',
		isOnline = true,
		gps = new google.maps.Geocoder();
		
	loadEntries();
	
	function getHtmlForEntry(key, entry) {
		var sData = JSON.parse(entry);
		var actionLinks = '<span class="actions"><img class="edit" src="http://cdn1.iconfinder.com/data/icons/diagona/icon/16/019.png" /><img class="delete" src="http://cdn1.iconfinder.com/data/icons/diagona/icon/16/101.png" /></span>';
		return '<article rel="'+key+'"><h2>'+sData.title+'</h2><p>'+actionLinks+sData.content+'<br/><br/>'+sData.location+'</p></article>';
	}

	function setGeoLocationHtml() {
		if (navigator.geolocation && isOnline) {
				navigator.geolocation.getCurrentPosition(
					function(pos) {
						if (gps) {
						var latLong =  new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
						gps.geocode({'latLng': latLong}, function (results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							entryLocation = '<span class="location">Near <a href="https://maps.google.es?q='+results[0].formatted_address+'"> ' + results[0].formatted_address + '</a></span>';
						}
					});
				}
			},
				function (err) {
				})
		}
	}
	
	function loadEntries() {
		setGeoLocationHtml();
		container.empty();
    	for (i=0; i<=localStorage.length-1; i++) {
			var key = localStorage.key(i);
    		container.prepend(getHtmlForEntry(key, localStorage.getItem(key)));
    	}
	}
	
	$(".delete").click(function() {
		var entryKey = $("article.selected").attr("rel");
		localStorage.removeItem(entryKey);
		$("article.selected").remove();
	});
	
	$(".edit").click(function() {
		var locationText = $("article.selected p span.location").text();
		var paragraphText = $("article.selected p").text();
		$("article.selected p").hide();
		$("article.selected").append($("#entry-form"));
		$("#entry-form").toggleClass("hidden");
		$("#entry-title").val($("article.selected h2").text());
		$("#entry-content").text(paragraphText.substring(0, paragraphText.indexOf(locationText)));
		key = $("article.selected").attr("rel");
	});

    $("#icon-add").click(function() {
        $("#entry-form,#icon-add").toggleClass("hidden");
        $("#header").focus();
    });

    $("article h2").click(function() {
        var selected = $(this).parent().hasClass("selected");
        $("article").removeClass("selected");
        if (!selected) {
            $(this).parent().addClass("selected");
        }
    });

	$("#saveEntry").click(function() {
		var jsonData = {'title':entryTitle.val(), 'content': entryContent.val(), 'location': entryLocation};
		if (key == '') { 
			key = Math.round(new Date().getTime() / 100);
			localStorage.setItem(key, JSON.stringify(jsonData));
		} else {
			localStorage.setItem(key, JSON.stringify(jsonData));
		}
		key = '';
		$("article.selected p").show();
	});
	
	$("#saveCancel").click(function() {
		$("article.selected p").remove("#entry-form");
		$("#entry-form").toggleClass("hidden");
		key = '';
		$("article.selected p").show();
	});
	
	function blink(){
		if (!isOnline)
			$('.light').delay(300).fadeTo(100,0.3).delay(200).fadeTo(200,1, blink);
	}
	
	(function indicate() {
		var indicator = $("#icon-connection-lost");
		indicator.hide();
		//check if supported by the browser
		if ("onLine" in navigator) {			
			//initialize if already online or offline
			(navigator.onLine) ? on() : off();
			
			//add event listeners
			window.addEventListener("online", on);
			window.addEventListener("offline", off);
		}

		function on(e) {
			isOnline = true;
			indicator.hide();
		}

		function off(e) {
			isOnline = false;
			indicator.show();
			blink();
		}
	})();
});