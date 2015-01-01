$(document).ready( function ( ) { 

	var context;

	if ("webkitAudioContext" in window) {
		context = new webkitAudioContext();
	}

	if ("AudioContext" in window) {
		context = new AudioContext();
	}

	var random = (function ( ) {
		var randgen = {};

		var m_w = 123456789;
		var m_z = 987654321;
		var mask = 0xffffffff;

		// Takes any integer
		randgen.seed = function (i) {
		    m_w = i;
		    m_z = 987654321;
		}

		// Returns number between 0 (inclusive) and 1.0 (exclusive),
		// just like Math.random().
		randgen.random = function ( )
		{
		    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
		    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
		    var result = ((m_z << 16) + m_w) & mask;
		    result /= 4294967296;
		    return result + 0.5;
		}

		return randgen;
	}());


	// generate a white noise buffer and store it in context:
	(function (audioContext) {
		if (!("whiteNoiseBuffer" in audioContext)) {
			var bufferSize = audioContext.sampleRate * 2;
		    var buffer = audioContext.createBuffer(1,bufferSize * 2, audioContext.sampleRate);
			var samples = buffer.getChannelData(0);
			for (var i = 0;i<bufferSize;i++) {
				samples[i] = (Math.random() * 2.0) - 1.0;
			}
			audioContext.whiteNoiseBuffer = buffer;
		}
	} (context) );

	// add a function to the audioContext play the white noise buffer as a bufferSource.
	(function (audioContext) {
		if (typeof(audioContext.createWhiteNoise2) !== 'function') {
			audioContext.createWhiteNoise2 = function ( ) {
				var node = audioContext.createBufferSource();
				node.buffer = audioContext.whiteNoiseBuffer;
				node.loop = true;

				return node;
			}
		}
	}(context));

	(function(AudioContext) {
		AudioContext.prototype.createWhiteNoise = function(bufferSize,seed) {
			bufferSize = bufferSize || 1024;
			seed = seed || 0;
			var node = this.createScriptProcessor(bufferSize, 1, 1);
			node.onaudioprocess = function(e) {
				var output = e.outputBuffer.getChannelData(0);
				for (var i = 0; i < bufferSize; i++) {
					output[i] = Math.random() * 0.1 - 0.05;
				}
			}
			return node;
		};

		AudioContext.prototype.createPinkNoise = function(bufferSize) {
			bufferSize = bufferSize || 4096;
			var b0, b1, b2, b3, b4, b5, b6;
			b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
			var node = this.createScriptProcessor(bufferSize, 1, 1);
			node.onaudioprocess = function(e) {
				var output = e.outputBuffer.getChannelData(0);
				for (var i = 0; i < bufferSize; i++) {
					var white = Math.random() * 2 - 1;
					b0 = 0.99886 * b0 + white * 0.0555179;
					b1 = 0.99332 * b1 + white * 0.0750759;
					b2 = 0.96900 * b2 + white * 0.1538520;
					b3 = 0.86650 * b3 + white * 0.3104856;
					b4 = 0.55000 * b4 + white * 0.5329522;
					b5 = -0.7616 * b5 - white * 0.0168980;
					output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
					output[i] *= 0.11; // (roughly) compensate for gain
					b6 = white * 0.115926;
				}
			}
			return node;
		};

		AudioContext.prototype.createBrownNoise = function(bufferSize) {
			bufferSize = bufferSize || 4096;
			var lastOut = 0.0;
			var node = this.createScriptProcessor(bufferSize, 1, 1);
			node.onaudioprocess = function(e) {
				var output = e.outputBuffer.getChannelData(0);
				for (var i = 0; i < bufferSize; i++) {
					var white = Math.random() * 2 - 1;
					output[i] = (lastOut + (0.02 * white)) / 1.02;
					lastOut = output[i];
					output[i] *= 3.5; // (roughly) compensate for gain
				}
			}
			return node;
		};
	})(webkitAudioContext || AudioContext);

	Math.tanh = function(x) 
	{
	    if( x < -3 )
	        return -1;
	    else if( x > 3 )
	        return 1;
	    else
	        return x * ( 27 + x * x ) / ( 27 + 9 * x * x );
	}


	Function.prototype.method = function(name,func) {
		this.prototype[name] = func;
		return this;
	} // Crockfords method adder.

	Function.method('curry', function ( ) {
	    var slice = Array.prototype.slice,
	        args = slice.apply(arguments),
	        that = this;
	    return function (  ) {
	        return that.apply(null, args.concat(slice.apply(arguments)));
	    };
	});

		



	// returns an iterable object based on an array (it loops by default).
	Array.prototype.iterator = function () {
		var that = this;
		var i = 0;
		return { next:function () {
			return that[i++%that.length];
		},reset:function( ) {
			i = 0;
		}
	}
	};

	function isFunction(functionToCheck) { // to check is something is function
	 var getType = {};
	 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	}

	var cs =  { // helper functions
		rv:function(a,b) { // random value float!
			return (Math.random() * Math.abs(a-b)) + Math.min(a,b);
		},
		randint:function(a,b) { // random int 
			return (Math.floor(this.rv(a,b+1)));
		},
		mtof:function(midi) { // midi to freq
			return 440 * this.mtor(midi-69);
		},
		mtor:function(midi) { // midi to ratio (for transposing)
			return Math.pow(2.0, (midi/12.0));
		},
		rf:function(a,b) { // returns a random frequency between to midi values
			return this.mtof(this.rv(a,b));
		},
		ftom:function(frequency) { // freq to midi note (float)
			return (12 * this.logOfWithBase((freq/440.0),2)) + 69;
		},
		rtom:function(ratio) { // ratio to midi interval
			return 12 * this.logOfWithBase(ratio,2);
		},
		logOfWithBase:function(x,base) { // example: '10'log of 100 = 2
			return log(x) / log(base);
		},
		choose:function(list) { // choose random from list
			if (list instanceof Array) {
				return list[Math.floor(Math.random()*list.length)];
			} else {
				return list;
			}
		},
		randIndex:function(list) { // return a random index based on listSize
			return Math.floor(Math.random() * list.length);
		}
		,
		listWithGenAmount:function(generator,amount) { // generate list with a function
			var result = [];
			while(amount--) {
				result.push(generator());
			}
			return result;
		},
		listWithIterAmount:function(iterator,amount) {
			return this.listWithGenAmount(function( ) { return iterator.next(); } ,amount);
		},
		ev:function(alpha) { // exponential value
			return Math.log(1.0 - (Math.random()) / (-alpha));
		},
		wchoice:function(valueWeightList) {// weighted choice [[50,3],[100,2]] = 3/2 as many 50 as 100.
			var sum = 0;
			var i = valueWeightList.length;

			while(i--) {
				sum += valueWeightList[i][1];
			}

			var p = Math.random() * sum;
			
			var item = 0;
			var weight = 0;

			var i = valueWeightList.length;
			while(i--) {
				item = valueWeightList[i][0];
				weight = valueWeightList[i][1];
				if (p < weight) {
					break;
				} else {
					p -= weight;
				}
			}
			return item;
		},
		scale:function(x,minIn,maxIn,minOut,maxOut) {
			return (((input - Math.min(minIn,maxIn)) / Math.abs(minIn-maxIn)) * Math.abs(maxOut-minOut)) + Math.min(minOut,maxOut);
		},
		reduce:function(list,reducer) {
			var i;
			var value = 0;
			for (i = 0;i<list.length;i++) {
				value = reducer(list[i],value);
			}
			return value;
		},
		sum:function(list) {
			return this.reduce(list,function(a,b) {
				return a + b;
			});
		},
		repeat:function(f,numberOfTimes) { // repeat a function
			for (var i = 0;i < numberOfTimes; i++) {
				f(i);
			}
		},
		generateList:function(generator,amount) {
			var result = [];
			for (var i = 0;i<amount;i++) {
				result.push(generator());
			}
			return result;
		},
		range:function(start,stop,step) {
			var result = [];
			var value = start;
			while(value <= stop) {
				result.push();
				value += step;
			}
			return result;
		},
		constIter:function(value) {
			this.next = function() {
				return value;
			}
			this.reset = function() {
				return value;
			}
		},
		harmonicIter:function(startfreq) {
			var distance = startfreq;
			this.next = function() {
				var value = startfreq;
				startfreq += distance;
				return value;
			};
			this.reset = function() {
				startfreq = null;
			}
		},
		stepIter:function(start,step) {
			var last = start;
			this.next = function() {
				var value = last;
				if (isFunction(step)) {
					last = step(value);
				} else {
					last += step;
				}
				return value;
			}
			this.reset = function() {
				last = start;
			}
		},
		stepIter2nd:function(start1,start2,step) {
			var last1 = start1;
			var last2 = start2;
			this.next = function() {
				var mem = last1;
				last1 = step(last1,last2);
				last2 = mem; 
				return last1;

			}
			this.reset = function() {
				var last1 = start1;
				var last2 = start2;
			}
		},
		stepIterHistory:function(seed,step) {
			var history = seed;
			this.next = function( ) {
				var value = step(history);
				history.push(value);
				return value;
			}
			this.reset = function( ) {
				history = seed;
			}
		},
		generateDecayCurve:function(a,b,precision) { // generates a decaying curve from a to b + preciscion... precisicion decides sharpness of curve.
			var curveLength = 4096;
			var curve = new Float32Array(curveLength);
			value = 1;
			
			ratio = Math.pow(precision,1/curveLength);
			for (var i = 0; i < curveLength; ++i) {
				if (i+1 === curveLength) {
					value = 0;
				}
	    		curve[i] = (value * Math.abs(a-b)) + Math.min(a,b);
	    		value *= ratio;	
	    	}

	    	return curve;
		},
		genNoiseBuffer:function(numberOfSamples) {
			var noiseBuffer = new Float32Array(numberOfSamples);
			for (var i = 0;i<numberOfSamples;++i) {
				noiseBuffer[i] = (Math.random() * 2) - 1;
			}
			return noiseBuffer;
		},
		fill:function(size,value) {
			var result = Array(size);
			for (var i = 0;i<size;i++) {
				result[i] = value;
			}
			return result;
		}
	}

	var Synth = function(context) { // simple synth
		this.context = context;
		
		this.sawToothEvent = function(startTime,frequency,duration,amplitude) {
			var sawOsc = this.context.createOscillator();
			var gain = this.context.createGain();
			var panner = this.context.createPanner();

			// amplitude envelope
			gain.gain.setValueAtTime(amplitude,startTime);
			gain.gain.setTargetAtTime(0,startTime,duration)

			panner.setPosition(cs.rv(-1,1),1,0);

			sawOsc.type = "sine";
			sawOsc.frequency.setValueAtTime(frequency,startTime);

			sawOsc.connect(gain);
			gain.connect(panner);
			panner.connect(this.context.destination);

			sawOsc.start(startTime);n

			sawOsc.noteOff(startTime+(duration*3));
		};

		this.bassDrumEvent = function(startTime,freq1,freq2,duration) {
			var SinOsc = this.context.createOscillator();
			var Gain = this.context.createGain();
			var Distortion = this.context.createWaveShaper();
			var Output = this.context.createGain();

			// this will generate a curve for nice softclipping
			var curveLength = 4096;
			var tanhCurve = new Float32Array(curveLength);
			for (var i = 0; i < curveLength; ++i) {
	    		tanhCurve[i] = Math.tanh(((i/curveLength)*2)-1);
	    	}
	    	Distortion.curve = tanhCurve;

			SinOsc.connect(Gain);
			Gain.connect(Distortion);
			Distortion.connect(Output);
			Output.connect(context.destination);

			// this generates the decaying frequency.
			var curve = cs.generateDecayCurve(freq1,freq2,0.00001);
			value = 1;

			if (!this.ampCurve) {
				this.ampCurve = cs.generateDecayCurve(1,0,0.01);
			}

			Gain.gain.value = 0.0;
			SinOsc.frequency.setValueCurveAtTime(curve,startTime,duration);
			Gain.gain.setValueAtTime(0,startTime);
			//Gain.gain.setValueAtTime(1,startTime+0.0001);
			Gain.gain.setValueCurveAtTime(this.ampCurve,startTime,duration);

			Output.gain.setValueAtTime(0.5,startTime);

			SinOsc.start(startTime);
			SinOsc.stop(startTime+duration);
		}

		this.snareEvent = function(startTime,freq1,duration) {
			var SinOsc = this.context.createOscillator();
			var SinGain = this.context.createGain();
			var NoiseGen = this.context.createWhiteNoise2();
			var NoiseGain = this.context.createGain();
			var GainOut = this.context.createGain();

			SinOsc.frequency.value = freq1;
			SinGain.gain.setValueAtTime(0.4,startTime);
			
			SinOsc.connect(SinGain);
			SinGain.connect(GainOut);

			SinOsc.start(startTime);
			SinOsc.stop(startTime+duration);

			NoiseGen.connect(NoiseGain);
			NoiseGen.start(startTime);
			NoiseGain.gain.setValueAtTime(0.1,startTime);
			NoiseGain.gain.setValueAtTime(0,startTime+duration);
			NoiseGen.stop(startTime+duration+0.01);

			GainOut.gain.value = 0; // this puts the start at 0.
			GainOut.gain.setValueAtTime(0.1,startTime);
			GainOut.gain.exponentialRampToValueAtTime(0.001,startTime+duration);

			NoiseGen.connect(GainOut);
			GainOut.connect(this.context.destination);
		}

		this.hihatEvent = function(startTime,freq1,duration,pan) {
			currentTime = this.context.currentTime;
			var noiseGen = this.context.createWhiteNoise2();
			var ampNode = this.context.createGain();
			var highPassFilter = this.context.createBiquadFilter();
			var panner = this.context.createPanner();
			panner.setPosition(pan,1,1);

			// noiseGen -> ampNode -> highPassFilter -> destination

			noiseGen.start(startTime);
			noiseGen.connect(ampNode);
			ampNode.connect(highPassFilter);
			highPassFilter.connect(panner);
			panner.connect(this.context.destination);

			highPassFilter.frequency.value = freq1;
			highPassFilter.type = 'highpass';
			highPassFilter.Q.value = 10.0;

			ampNode.gain.setValueAtTime(0.1,startTime);
			ampNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
			ampNode.gain.linearRampToValueAtTime(0,startTime + duration + 0.001);

			noiseGen.stop(startTime + duration + 0.01);
		}
	}

	var synth = new Synth(context);
	// pinkNoise.connect(audioContext.destination);


	// this is an event schedular that uses a combination of JS clock and the webaudio one, to get accurate timing
	// see this page for more info on that approach: http://www.html5rocks.com/en/tutorials/audio/scheduling/
	var Schedular = function(context,interval,lookAhead,mevent) {
		var timerID = null; // a schedular based on tale of two clocks tutorial
		this.eventStartTime = 0; // pointer of time.

		var that = this;
	    
	    this.scheduleNextEvents = function( ) {
	    	var now = context.currentTime;
			while(this.eventStartTime < (now + lookAhead)) {
				mevent.next(this.eventStartTime);
				this.eventStartTime += mevent.nextEntryDelay();
			}
		};

	    this.start = function( ) {
			var schedule = function( ) {
				that.scheduleNextEvents();
			}
			timerID = setInterval(function( ) {
				schedule();
			},interval*1000);
		};

		this.stop = function( ) {
			clearInterval(timerID);
			timerID = null;
			that.eventStartTime = null;
			mevent = null;
		};
	};

	function BufferLoader(context, urlList, callback) {
	    this.context = context;
	    this.urlList = urlList;
	    this.onload = callback;
	    this.bufferList = new Array();
	    this.loadCount = 0;
	}

	BufferLoader.prototype.loadBuffer = function(url, index) {
	    // Load buffer asynchronously
	    var request = new XMLHttpRequest();
	    request.open("GET", url, true);
	    request.responseType = "arraybuffer";

	    var loader = this;

	    request.onload = function() {
	        // Asynchronously decode the audio file data in request.response
	        loader.context.decodeAudioData(
	            request.response,
	            function(buffer) {
	                if (!buffer) {
	                    alert('error decoding file data: ' + url);
	                    return;
	                }
	                loader.bufferList[index] = buffer;
	                if (++loader.loadCount == loader.urlList.length)
	                    loader.onload(loader.bufferList);
	            },function(error) { console.error ('decodeAudioData error', error);
	        	}    
	        );
	    }

	    request.onerror = function() {
	        alert('BufferLoader: XHR error, is this file not located in httpdocs of a server ?');        
	    }

	    request.send();
	}

	BufferLoader.prototype.load = function() {
	    for (var i = 0; i < this.urlList.length; ++i)
	        this.loadBuffer(this.urlList[i], i);
	}

	var SawTest = function( ) {
		var baseFreq = cs.choose([cs.rv(20,800)]);
		var harmIter = new cs.HarmonicIter(baseFreq);
		var harmonics = cs.listWithIterAmount(harmIter,10);

		this.nextEntryDelay = function( ) {
			return 1.0 / (cs.mtof(cs.rv(-30,10)));
		}
		this.next = function(eventStartTime) {
			synth.sawToothEvent(eventStartTime,this.nextFreq(),this.nextDur(),0.1);
		}
		this.nextFreq = function( ) {
			return cs.choose(harmonics);
		}
		this.nextDur = function( ) {
			return 1.0 / (cs.mtof(cs.rv(-40,-20)));
		}
	};

	var SnareTest = function ( pattern ) {
		var patternIter = pattern.iterator();

		this.nextEntryDelay = function( ) {
			return 1.0 / 10.0;
		}
		this.next = function(eventStartTime) {
			if (patternIter.next() > 0) {
				synth.snareEvent(eventStartTime,120,this.nextDur());	
			}
		}
		this.nextDur = function( ) {
			return 0.5;
		}
	}

	var HihatTest = function (pan,pattern) {

		var patternIter = pattern.iterator();
		
		this.nextEntryDelay = function ( ) {
			return 1/10.0;
		}

		this.nextFreq = function ( ) {
			return cs.rv(1000,10000);
		}	

		this.next = function(eventStartTime) {
			if (patternIter.next() > 0) {
				synth.hihatEvent(eventStartTime,this.nextFreq(),this.nextDur(),pan);
			}
		}

		this.nextDur = function ( ) {
			return 0.25;
		}

	}

	var BasDrumTest = function(pattern) {
		var patternIter = pattern.iterator();
		this.nextEntryDelay = function ( ) { 
			return 1 / 10.0;
		}

		this.next = function(eventStartTime) {
			if (patternIter.next() > 0) {
				synth.bassDrumEvent(eventStartTime,200,20,this.nextDur()); // startTime,freq1,freq2,duration
			}
		}

		this.nextDur = function ( ) {
			return 0.5;
		}
	}

	// this is the real algorithmic part, a 'music' piece
	var ReichTest = function( ) {
		// custom parameters for this particular instrument
		var BPM = 130;
		var T = 60 / BPM; // dur per beat
		var timeMup = 1; // note division

		var freqs = [220,220,220,220,220,220,220,220]; // initialize the array with 220.
		var allowedRatios = [2/3,3/2,4/3,3/4];
		var allowedTimeMups = [1,1/2];

		var currentIndex = 0; // this is local index for looping the this.freqs.
		
		this.updateFreqs = function ( ) {		
			var size = freqs.length;
			var index = Math.floor(Math.random() * size);
			var nextIndex = (index + 1) % size;

			var nextFreq = freqs[index] * cs.choose(allowedRatios);
			if (nextFreq < 50 || nextFreq > 8000) { 
				nextFreq = 220; 
			}
			freqs[nextIndex] = nextFreq;
		}

		var that = this;
		
		(function ( ) {
			var updateFreqTimer,updateTimeMupTimer;

			var updateTimeMup = function ( ) {
				timeMup = cs.choose(allowedTimeMups);
			}

			updateFreqTimer = setInterval(function ( ) {
				that.updateFreqs();
			},3000);

			updateTimeMupTimer = setInterval(updateTimeMup,5000);

		}());

		// this must be implemented !
		this.nextEntryDelay = function( ) { 
			//console.log("timeMup is now = "+timeMup);
			return T * timeMup;
		}
		// this must be implemented as well !
		this.next = function(eventStartTime) {
			synth.sawToothEvent(eventStartTime,this.nextFreq(),this.nextDur(),0.1);
		}
		// these are called by the 'next' function;
		this.nextFreq = function( ) {		
			return freqs[currentIndex++ % freqs.length];
		}
		// this one as well.
		this.nextDur = function( ) {
			return T * timeMup;
		}
	};

	// this creates the first pattern, it is a array of 1 and 0's with a jQuery gui.
	var Pattern = function (nameString,pattern) {
		this.name = nameString || 'noname';
		this.pattern = pattern || [1,0,0,0,0,0,0,0];		
	};

	Pattern.prototype.createGUI = function ( ) {
		$("body").append('<p></p>');
		for (var i = 0;i<this.pattern.length;i++) {
			$("body").append('<div id="cell'+this.name+i+'" class="patternCell noselect">.</div>');

			var patt = this.pattern;

			var clickFunction = function (index,element) { // because of scoping, make a function return a function.
				return function ( ) {
				  	patt[index] = (patt[index] === 0) ? 1 : 0;
				  	var color = ( patt[index] === 1 ) ? "#000" : "#ddd";
				  	$(this).css("background-color",color);
				};
			}
			
			$( ("#cell"+this.name+i) )
			.css("background-color",( this.pattern[i] === 1 ) ? "#000" : "#ddd")
			.css("color","white")
			.click( clickFunction(i,this) );
		}
	};

	
	var pattern = new Pattern("hihat1",[1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0])
	pattern.createGUI(); // create first gui



	var pattern2 = new Pattern("hihat2",[1,0,0,1,1,1,1,1,1,0,1,0,0,0,0,0]);
	pattern2.createGUI();

	var pattern3 = new Pattern("kick",[1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0]); // another object....
	pattern3.createGUI();

	var pattern4 = new Pattern("snare",[1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0]);
	pattern4.createGUI();

	var hiHatTest = new HihatTest(-1,pattern.pattern); // create a hiHat test event creator
	var schedular = new Schedular(context,0.05,0.07,hiHatTest); // play it with a schedular
	schedular.start(); // start playback 

	var hiHatTest2 = new HihatTest(1,pattern2.pattern);
	var schedular2 = new Schedular(context,0.05,0.07,hiHatTest2);
	schedular2.start();

	var bassDrumTest = new BasDrumTest(pattern3.pattern);
	var schedular3 = new Schedular(context,0.05,0.07,bassDrumTest);
	schedular3.start();

	var snareDrumTest = new SnareTest(pattern4.pattern);
	var schedular4 = new Schedular(context,0.05,0.07,snareDrumTest);
	schedular4.start();


});





/*
var mevents = [];
var schedulars = [];

var i;
cs.repeat(function(i) {
	mevents.push(new ReichTest());
	schedulars.push(new Schedular(context,0.05,0.07,mevents[i]));
	schedulars[i].start();
},2);

setTimeout(function( ) {
	var amount = schedulars.length;
	for (var i = 0;i<amount;i++) {
		schedulars[i].stop();
	}
},300000);
*/