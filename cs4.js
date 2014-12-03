Math.tanh = function(x) {
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
	ConstIter:function(value) {
		this.next = function() {
			return value;
		}
		this.reset = function() {
			return value;
		}
	},
	HarmonicIter:function(startfreq) {
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
	StepIter:function(start,step) {
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
	StepIter2nd:function(start1,start2,step) {
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
	StepIterHistory:function(seed,step) {
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
	GenerateDecayCurve:function(a,b,precision) { // generates a decaying curve from a to b + preciscion... precisicion decides sharpness of curve.
		var curveLength = 4096;
		var curve = new Float32Array(curveLength);
		value = 1;
		
		ratio = Math.pow(precision,1/curveLength);
		for (var i = 0; i < curveLength; ++i) {
    		curve[i] = ((value * Math.abs(a-b)) + Math.min(a,b)) - precision;
    		value *= ratio;	
    	}

    	return curve;
	},
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

		sawOsc.start(startTime);


		sawOsc.noteOff(startTime+(duration*3));
	};

	this.bassDrumEvent = function(startTime,freq1,freq2,duration,curve) {
		var SinOsc = this.context.createOscillator();
		var Gain = this.context.createGain();
		var Distortion = this.context.createWaveshaper();
		var Output = this.context.createGain();

		// this will generate a curve for nice softclipping
		var curveLength = 4096;
		var tanhCurve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; ++i) {
    		curve[i] = Math.tanh(((i/curveLength)*2)-1);
    	}
    	Distortion.curve = tanhCurve;

		SinOsc.connect(Gain);
		Gain.connect(Distortion);
		Distortion.connect(Output);
		Output.connect(context.destination);

		// this generates the decaying frequency.
		var curve = cs.createCurve(freq1,freq2,0.001);
		value = 1;

		var ampCurve = cs.createCurve(1,0,0.0001);

		SinOsc.frequency.setValueCurveAtTime(curve,startTime,duration);
		Gain.gain.setValueCurveAtTime(ampCurve,startTime,duration);
	}
}


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

var context = new AudioContext();
var synth = new Synth(context);

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




