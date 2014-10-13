do ($ = jQuery, window, document) ->

	pluginName = "coverrr"
	defaults =
		duration: 20 										# animation-duration
		direction: 'alternate' 					# animation-direction: alternate, alternate-reverse, normal, reverse
		delay: 0 												# animation-delay
		timingFunction: 'ease-in-out' 	# animation-timing-function: linear, ease, ease-out, ease-in, etc
		iterationCount: 'infinite'			# animation-iteration-count: integer or 'infinite'

	_css =
		animation: false
		transform: false
		animation_string: 'animation'
		transform_string: 'transform'
		prefix: ''

	# The actual plugin constructor
	class Plugin
		constructor: (@el, options) ->
			@settings = $.extend {}, defaults, options
			@_defaults = defaults
			@_name = pluginName

			@_el = $ @el
			@cover = $ '<img>'
			@img = 
				src: @getImageSrc()
				w: 0
				h: 0
				ratio: 0			

			if _css.animation is true
				@getBg().then @init
			else
				console.log 'Your browser does not support CSS animations. ' + pluginName + ' won\'t run this time'

		init: =>
			@convertBgToCover()
			@update()

			# console.log @img

		convertBgToCover: () ->
			pos = @_el.css 'position'
			if pos == 'static'
				pos = 'relative'
			@_el.css
				'overflow': 'hidden'
				'background-image': 'none'
				'position' : pos
			@cover.attr 'src', @img.src
			@cover.css
				'top': 0
				'left': 0
				'position': 'absolute'
				'z-index': -1
			@cover.prependTo @_el

		update: () ->
			console.log 'update'
			@id = (((1+Math.random())*0x10000)|0).toString(16).substring(1)
			elSize = [@_el.outerWidth(), @_el.outerHeight()]
			elRatio = elSize[0] / elSize[1]
			
			@cover[0].style[_css.animation_string] = 'coverrr' +
					@id + ' ' +
					@settings.duration + 's ' +
					@settings.timingFunction + ' ' +
					@settings.delay + 's ' +
					@settings.iterationCount + ' ' +
					@settings.direction

			if elRatio > @img.ratio
				# vertical move
				diff = Math.round(elSize[1] - elSize[0] * @img.h / @img.w)
				@cover.css
					'width': elSize[0] + 'px'
					'height': 'auto'

				keyframes = '@' + _css.prefix + 'keyframes coverrr'+@id+' { '+
          'from {' + _css.prefix + 'transform:translateY( 0 ) }'+
          'to {' + _css.prefix + 'transform:translateY( ' + diff + 'px ) }'+
          '}'

			else
				# horizontal move
				diff = Math.round(elSize[0] - elSize[1] * @img.w / @img.h)
				@cover.css
					'width': 'auto',
					'height': elSize[1] + 'px'
				keyframes = '@' + _css.prefix + 'keyframes coverrr'+@id+' { '+
          'from {' + _css.prefix + 'transform:translateX( 0 ) }'+
          'to {' + _css.prefix + 'transform:translateX( ' + diff + 'px ) }'+
          '}'

			if document.styleSheets and document.styleSheets.length
			  document.styleSheets[0].insertRule keyframes, 0
			else
			  s = document.createElement("style")
			  s.innerHTML = keyframes
			  document.getElementsByTagName("head")[0].appendChild s

		getImageSrc: () ->
			i = ($ @el).css('background-image')
			i.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0]

		getBg: () ->
			deferred = $.Deferred()
			@loadImage(@img.src).done (image) =>
				@img.w = image.width
				@img.h = image.height
				@img.ratio = image.width / image.height
				deferred.resolve()
			deferred.promise()

		loadImage: (src) ->
		  $.Deferred((task) ->
		    image = new Image()
		    image.onload = ->
		      task.resolve image
		      return

		    image.onerror = ->
		      task.reject()
		      return

		    image.src = src
		    return
		  ).promise()

	
	# Test for CSS animation support
	do getPrefixes = ->
		prefixes = 'Webkit Moz O ms Khtml'.split ' '
		el = document.createElement 'p'
		document.body.insertBefore el, null

		_css.animation = true if el.style.animationName
		_css.transform = true if el.style.transform
		
		if _css.animation is false
			i = 0
			while i < prefixes.length
			  if el.style[prefixes[i] + "AnimationName"] isnt `undefined`
			    pfx = prefixes[i]
			    _css.animation_string = pfx + "Animation"
			    _css.prefix = "-" + pfx.toLowerCase() + "-"
			    _css.animation = true
			    break
			  i++

		if _css.transform is false
			i = 0
			while i < prefixes.length
			  if el.style[prefixes[i] + "Transform"] isnt `undefined`
			    pfx = prefixes[i]
			    _css.transform_string = pfx + "Transform"
			    _css.animation = true
			    break
			  i++

		document.body.removeChild el

	# Plugin wrapper around the constructor,
	# preventing against multiple instantiations
	$.fn[pluginName] = (options) ->
		@each ->
			unless $.data @, "plugin_#{pluginName}"
				$.data @, "plugin_#{pluginName}", new Plugin @, options

