'use strict';

var messagesByLanguage = {
	en: {
		loading: 'loading',
		error: 'error',
	},
	uk: {
		loading: 'завантаження',
		error: 'помилка',
	}
};

var languageCode;
var messages;

var documentsCache = {};

// return file contents from cache or fetch it from network
function loadDocument (url, done, fail) {
	var cached = documentsCache[url];
	if (cached) {
		done(cached);
	} else {
		return $.get(url)
			.done(function (html) {
				documentsCache[url] = html;
				done(html);
			})
			.fail(function (xhr) {
				var error;
				if (xhr.status == 0) {
					error = new Error('Network error');
				} else {
					error = new Error(xhr.status + ": " + xhr.statusText);
				}
				fail(error);
			});
	}
}

// 'works/' related functions

function loadWork (url, workContainer) {
	workContainer.text(messages.loading + "...");
	loadDocument(url, function (html) {
		workContainer.html('');
		var work = $('.work', html);
		$('<div>').addClass('work').append(work.find('.media, .text')).appendTo(workContainer);
	}, function (error) {
		workContainer.text(messages.error + ": " + error);
	});
}

function initWorksItem (index, element) {
	var worksItem = $(element);
	var header = worksItem.find('.header');
	var link = header.find('.link');
	var workContainer = worksItem.find('.work-container');
	var open = $('<a>')
		.addClass('open')
		.text('+')
		.on('click', function () {
			if (workContainer.find('.work').length == 0) {
				loadWork(link.attr('href'), workContainer);
			}
			worksItem.removeClass('closed').addClass('opened');
		});
	var close = $('<a>')
		.addClass('close')
		.text('-')
		.on('click', function () {
			worksItem.removeClass('opened').addClass('closed');
			toggleAllWorksUrl(false);
		});
	link.before(open).before(close);
}

function toggleAllWorksUrl(shouldBeAllWorksUrl) {
	if (shouldBeAllWorksUrl) {
		location.hash = 'all';
	} else {
		location.hash = '';
	}
}

function openAllWorks() {
	$('.works-item .open').click();
	toggleAllWorksUrl(true);
}

function closeAllWorks() {
	$('.works-item .close').click();
	toggleAllWorksUrl(false);
}

// general

$(function () {

	languageCode = $('html').attr('lang');
	messages = messagesByLanguage[languageCode] || messagesByLanguage.en;

	$('#works').find('.works-item').each(initWorksItem);

	if (location.hash.indexOf('all') >= 0) {
		openAllWorks();
	}
});
