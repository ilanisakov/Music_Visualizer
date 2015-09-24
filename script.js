 (function(){
		"use strict";
		
		//CONSTANTS
		var NUM_SAMPLES = 1024;
		var SCREEN_RADIUS = 755;
		var SOUND_1 = 'media/Touch The Sky.mp3';
		
		//VARIABLES
		var canvas, ctx, canvas2, ctx2;
		var audioElement, analyserNode;
		var circleRadius;
		var strokeColor;
		var fillColor;
		var angle;
		
		//Init - function called when the page is loaded
		function init(){
			console.log("test1");
			
			// set up canvas stuff
			canvas = document.querySelector('#canvas');
			ctx = canvas.getContext("2d");
			canvas2 = document.querySelector('#bCanvas');
			ctx2 = canvas2.getContext("2d");
			strokeColor = 'rgba(0, 255, 0, 0.6)';
			fillColor = 'rgba(255, 0, 255, 0.6)';
			circleRadius = 10;
			angle=0;
			
			// get reference to <audio> element on page
			audioElement = document.querySelector('audio');
			
			// call our helper function and get an analyser node
			analyserNode = createWebAudioContextWithAnalyserNode(audioElement);
			
			//Get all our controls working
			setupUI();
			
			// load and play default sound into audio element
			playStream(audioElement,SOUND_1);
			
			//setup map function
			Number.prototype.map = function (in_min, in_max, out_min, out_max) {
				return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
			}
			
			// start animation loop
			update();
		}
		
		function createWebAudioContextWithAnalyserNode(audioElement) {
			var audioCtx, analyserNode, sourceNode;
			// create new AudioContext
			// The || is because WebAudio has not been standardized across browsers yet
			// http://webaudio.github.io/web-audio-api/#the-audiocontext-interface
			audioCtx = new (window.AudioContext || window.webkitAudioContext);
			
			// create an analyser node
			analyserNode = audioCtx.createAnalyser();
			
			/*
			We will request NUM_SAMPLES number of samples or "bins" spaced equally 
			across the sound spectrum.
			
			If NUM_SAMPLES (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
			the third is 344Hz. Each bin contains a number between 0-255 representing 
			the amplitude of that frequency.
			*/ 
			
			// fft stands for Fast Fourier Transform
			analyserNode.fftSize = NUM_SAMPLES;
			
			// this is where we hook up the <audio> element to the analyserNode
			sourceNode = audioCtx.createMediaElementSource(audioElement); 
			sourceNode.connect(analyserNode);
						
			//create DelayNode instance
			//delayNode = audioCtx.createDelay();
			//delayNode.delayTime.value = delayAmount;
			
			// here we connect to the destination i.e. speakers
			//analyserNode.connect(audioCtx.destination);
			
			sourceNode.connect(audioCtx.destination);
			//sourceNode.connect(delayNode);
			//delayNode.connect(analyserNode);
			analyserNode.connect(audioCtx.destination);
			return analyserNode;
		}
		
		//Sets up the functions for the whole UI
		function setupUI(){
			document.querySelector("#songSelect").onchange = function(e){
				playStream(audioElement,e.target.value);
			};
			document.querySelector("#bGColor").onchange = function(e){
				canvas2.style.backgroundColor = e.target.value;
			};
			document.querySelector("#sColor").onchange = function(e){
				strokeColor = e.target.value;
			};
			document.querySelector("#fColor").onchange = function(e){
				fillColor = e.target.value;
			};
			document.querySelector("#radiusSlider").onchange = function(e){
				circleRadius = e.target.value * 2;
			};
		}
		
		function playStream(audioElement,path){
			audioElement.src = path;
			audioElement.play();
			audioElement.volume = 0.2;
			//document.querySelector('#status').innerHTML = "Now playing: " + path;
		}
		
		// HELPER
		function makeColor(red, green, blue, alpha){
   			var color='rgba('+red+','+green+','+blue+', '+alpha+')';
   			return color;
		}
		
		//function bGColorChange(e)
		//{
		//	console.log('bgcolor');
		//	canvas.style.backgroundColor = e.value;
		//}
		
		//Update Loop
		function update() {
			requestAnimationFrame(update);
			var data = new Uint8Array(NUM_SAMPLES/2);
			var space = canvas.width / data.length;
			
			
			analyserNode.getByteFrequencyData(data);
						
			ctx.clearRect(0,0,1280,800);//clearing the top canvas
			
			ctx.save();
			ctx.lineWidth = 3;
			ctx.strokeStyle = strokeColor;
			for(var i = 0; i < data.length; i++)
			{
				//default line
				ctx.beginPath();
				ctx.moveTo(i * space, 750 - data[i]);
				if (i == (NUM_SAMPLES / 2) - 1)
				{
					ctx.lineTo(canvas.width, 750 - data[i]);
				}
				else
				{
					ctx.lineTo((i + 1) * space, 750 - data[i + 1]);
				}
				//ctx.strokeStyle = makeColor(255,0,0,data[NUM_SAMPLES / 4].map(0,255,0,1));
				ctx.stroke();
				ctx.closePath();
				
				//Circle
				ctx.save();
				ctx.fillStyle = fillColor;
				ctx.beginPath();
				ctx.arc(canvas.width/2, canvas.height/2, circleRadius * (data[i] / 15), 0, Math.PI * 2, false);
				ctx.fillStyle = makeColor(data[i],0,0,data[i].map(0,255,0,1));
				//ctx.globalAlpha = data[i].map(0,255,0,1);
				ctx.fill();
				ctx.closePath();
				ctx.restore();
			}
			ctx.restore();
			console.log(data[2] > 250 ? "yes" : "");
			var temp = data[2];
			drawBottom(temp);
			
		}
		
		function drawTop(){
		}
		
		function drawBottom(g){
			if( g > 250) {ctx2.strokeStyle = makeColor(0, 0, 0, 0.3);}
			else if(g > 225){ctx2.strokeStyle = makeColor(g, 0, g, 0.3);}
			else if( g > 215) {ctx2.strokeStyle = makeColor(g, g, 0, 0.3);}
			else if(g > 200){ctx2.strokeStyle = makeColor(0, g, 0, 0.3);}
			else if( g > 195) {ctx2.strokeStyle = makeColor(g, 0, 0, 0.3);}
			else if( g > 180) {ctx2.strokeStyle = makeColor(0, 0, g, 0.3);}
			else {ctx2.strokeStyle = makeColor(0, g, g, 0.3);}
			//ctx2.strokeStyle = makeColor(0, g, 0, 0.3);
			ctx2.lineWidth = 3;
			for(var i = 0; i < 3; i++){
				ctx2.beginPath();
				ctx2.moveTo(canvas2.width/2, canvas2.height / 2);
				ctx2.lineTo(SCREEN_RADIUS * Math.cos(angle + (i*90)) + canvas2.width / 2, SCREEN_RADIUS * Math.sin(angle + (i*90)) + canvas2.height / 2);
				ctx2.stroke();
				ctx2.closePath();
			}
			angle+= (1/60);
		}
		window.addEventListener("load",init);
 }());