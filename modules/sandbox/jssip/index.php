<html>
	<head>
		<script src="jssip-0.3.0.js"></script>
		<script>
		var configuration = {
			'ws_servers'		: 'ws://192.168.1.181:8088/ws/',
			'uri'				: 'sip:203@192.168.1.181',
			'authorization_user': '203',
			'password'			: 'aaa203',
			'registrar_server'	: '192.168.1.181',
		};

		var coolPhone	= new JsSIP.UA(configuration);
		var selfView	= document.getElementById('my-video');
		var remoteView	= document.getElementById('peer-video');

		var eventHandlers = {
			'progress':   function(e){
				/* Your code here */
			},
			'failed':     function(e){
				/* Your code here */
			},
			'started':    function(e){
				var rtcSession = e.sender;

				// Attach local stream to selfView
				if (rtcSession.getLocalStreams().length > 0) {
					selfView.src = window.URL.createObjectURL(rtcSession.getLocalStreams()[0]);
				}

				// Attach remote stream to remoteView
				if (rtcSession.getRemoteStreams().length > 0) {
					remoteView.src = window.URL.createObjectURL(rtcSession.getRemoteStreams()[0]);
				}
			},
			'ended':      function(e){
				/* Your code here */
			}
		};

		var options = {
			'eventHandlers'		: eventHandlers,
			'extraHeaders'		: [ 'X-Foo: foo', 'X-Bar: bar' ],
			'mediaConstraints'	: {'audio': true, 'video': true}
		};

		coolPhone.call('sip:202@192.168.1.181', options);

		</script>
	</head>
	<body>
		<video id="my-video"></video>
		<video id="peer-video"></video>
	</body>
</html>
