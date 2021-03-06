const eQuiz = {};

// doc ready
$(()=>{
    eQuiz.init();
});

// eQuiz initialization
eQuiz.init = () => {
    eQuiz.setGlobal();
    eQuiz.getDom();
    eQuiz.getE();
};

//set global variables
eQuiz.setGlobal = function() {
    //variable to work through the shuffledE array properly when assigning answers
    eQuiz.qNum = 0;
    //variable to assign answer set for the current question
    eQuiz.ansArray = [];
    eQuiz.randIndex = 0;
    //score counter
    eQuiz.score = 0;
    //in order for score to process correctly on start
    eQuiz.correctAns = "";
}

// Dom nodes into variables
eQuiz.getDom = () => {
    eQuiz.$header = $("header");
    eQuiz.$startB = $(".start");
    eQuiz.$main = $("main");
    eQuiz.$qScreen = $(".questionScreen");
    eQuiz.$questionForm = $("form");
    eQuiz.$hintToaster = $(".hintToaster");
    eQuiz.$getHint = $(".hintOnClick");
    eQuiz.$infoCard = $(".infoCard");
    eQuiz.$scoreScreen = $(".scoreScreen");
};

// use ajax to get the API
eQuiz.getE = () => {
    $.ajax({
        url: 'https://proxy.hackeryou.com',
        dataType: 'json',
        method: 'GET',
        data: {
            reqUrl: "https://elephant-api.herokuapp.com/elephants",
            xmlToJSON: false,
            useCache: false
        }
    }).then(function (data) {
        eQuiz.gatherE(data);
    });
};

eQuiz.shuffle = function (tempArray, originalArray) {
    // copy original array into the hat
    let hat = [...originalArray];
    let totalNumberOfDraws = originalArray.length
    for (i = 0; i < totalNumberOfDraws; i++) {
        // Each time, pick random item in hat
        this.randIndex = Math.floor(Math.random() * hat.length);
        // add item to tempArray
        tempArray.push(hat[this.randIndex]);
        // remove item from hat
        hat.splice(this.randIndex, 1);
    }// repeat
}

eQuiz.randomize = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

//set up event listeners
eQuiz.listenUp = function () {
    eQuiz.$startB.on('click', eQuiz.startQuiz);
    eQuiz.$questionForm.on('submit', eQuiz.submitAns);
    eQuiz.$getHint.on('click', eQuiz.toggleHint);
}

eQuiz.gatherE = function(data) {
    eQuiz.arrayOfE = [];
    data.forEach(function(elephant) {
        //process complete data only into array
        if (elephant.image !== "https://elephant-api.herokuapp.com/pictures/missing.jpg" && elephant.name !== undefined && elephant.species !== "Unavailable" && elephant.sex !== "Unavailable") {
            eQuiz.arrayOfE.push({name: elephant.name, affiliation: elephant.affiliation, species: elephant.species, sex: elephant.sex, image: elephant.image, note: elephant.note, wikilink: elephant.wikilink});
        }
    });
    //shuffle the elephants
    eQuiz.shuffleE();
    setTimeout(function() {
        $('#loading').hide();
        eQuiz.$startB.removeClass("cursorDefault");
        eQuiz.$startB.attr("tabindex", "1");
        $('#loadingComplete').show();
        eQuiz.listenUp();
    }, 1200);
}

//start the quiz
eQuiz.startQuiz = function() {
    //show/hide screens
    eQuiz.$header.hide();
    eQuiz.$main.show();
    eQuiz.$qScreen.show();
    //set question & answers & load
    eQuiz.nextQ();
}

eQuiz.toggleHint = function () {
    if (eQuiz.$hintToaster.hasClass("hintToasterIn")) {
        eQuiz.$hintToaster.addClass('hintToasterOut').removeClass('hintToasterIn');
        $(".hintOnClick i").css("color", "rgb(40, 44, 35)");
    } else if (eQuiz.$hintToaster.hasClass("hintToasterOut")) {
        eQuiz.$hintToaster.removeClass("hintToasterOut").addClass('hintToasterIn');
        $(".hintOnClick i").css("color", "rgb(255, 188, 143)");
    } else {
        eQuiz.$hintToaster.addClass("hintToasterIn");
        $(".hintOnClick i").css("color", "rgb(255, 188, 143)");
    }
}

eQuiz.submitAns = function (e) {
    e.preventDefault();
    if (eQuiz.correctAns.includes($("input[name='answer']:checked").val())) {
        eQuiz.ansIcon = "./assets/checkmark.png";
        // eQuiz.ansIcon = "warning";
    } else {
        eQuiz.ansIcon = "./assets/wrong.png";
        // eQuiz.ansIcon = "warning"
    }
    swal({
        title: `Meet ${eQuiz.shuffledE[eQuiz.qNum - 1].name}!`,
        text: `${eQuiz.shuffledE[eQuiz.qNum - 1].note}`,
        icon: eQuiz.ansIcon,
        buttons: {
            wiki: {
                text: "Learn more!",
                closeModal: false,
                value: "openlink",
            },
            confirm: {
                text: "Next!",
            }
        },
    }).then(function (value) {
        if (value === "openlink") {
            const win = window.open(`${eQuiz.shuffledE[eQuiz.qNum - 1].wikilink}`);
            win.focus();
            eQuiz.nextQ();
        } else {
            eQuiz.nextQ();
        }
    });
}
//////////////////////////////////////////////////////////////// DONEEEEE
// question section
eQuiz.qBank = ["What is my sex?", "What species am I?", "What is my name?", "Where am I from?"];

eQuiz.setQ = function() {
    eQuiz.currentQ = eQuiz.randomize(eQuiz.qBank);
};

eQuiz.nextQ = function() {
    //if statement to check if quiz is over or is beginning
    if (eQuiz.qNum === 5) {
        if (eQuiz.correctAns.includes($("input[name='answer']:checked").val())) {
            eQuiz.score++;
        }
        eQuiz.endQuiz();
    } else {
        //validate answer of q
        if (eQuiz.correctAns.includes($("input[name='answer']:checked").val())) {
            eQuiz.score++;
        }
        eQuiz.quizInit();
    }
}
/////////////////////////////////////////////////////////////////

eQuiz.quizInit = function() {
    eQuiz.ansArray = [];
    eQuiz.setQ();
    eQuiz.setA();
    //load question
    eQuiz.ansHtmlToAdd();
    eQuiz.compileHtmlDom();
    //ensure hinttoaster is closed if left open
    if (eQuiz.$hintToaster.hasClass("hintToasterIn")) {
        eQuiz.$hintToaster.addClass('hintToasterOut').removeClass('hintToasterIn');
        $(".hintOnClick i").css("color", "rgb(40, 44, 35)");
    }
    eQuiz.qNum++;
}

// answer section
eQuiz.setA = function() {
    if (eQuiz.currentQ === "What is my sex?") {
        eQuiz.getSex();
        eQuiz.hintText = `My name is ${eQuiz.shuffledE[eQuiz.qNum].name}!`;
    } else if (eQuiz.currentQ === "What species am I?") {
        eQuiz.getSpecies();
        eQuiz.hintText = `I'm from ${eQuiz.shuffledE[eQuiz.qNum].affiliation}!`;
    } else if (eQuiz.currentQ === "What is my name?") {
        eQuiz.getNames();
        eQuiz.hintText = `I'm a ${(eQuiz.shuffledE[eQuiz.qNum].sex).toLowerCase()}!`;
    } else if (eQuiz.currentQ === "Where am I from?") {
        eQuiz.getLocations();
        eQuiz.hintText = `I'm an ${eQuiz.shuffledE[eQuiz.qNum].species} elephant!`;
    }
}

//////////////////////////////////////////////////////////////
// set answer array if question was what is my sex?
eQuiz.getSex = function() {
    eQuiz.ansArray = ["Female", "Male"];
    eQuiz.correctAns = eQuiz.shuffledE[eQuiz.qNum].sex;
}
// set species array if question was what is my species?
eQuiz.getSpecies = function() {
    eQuiz.ansArray = ["Asian", "African", "Hybrid"];
    eQuiz.correctAns = eQuiz.shuffledE[eQuiz.qNum].species;
}

eQuiz.gatherNameList = function() {
    eQuiz.namesList = [];
    //gather names
    eQuiz.shuffledE.forEach(function(elephant) {
        //checks to make sure there's info in the data set
        // if (typeof elephant.name === 'string') {
            eQuiz.namesList.push(elephant.name);
        // }
    });
    //gather locations

}

eQuiz.gatherLocationList = function () {
    eQuiz.locationList = [];
    eQuiz.shuffledE.forEach(function (elephant) {
        //checks to make sure there's info in the data set
        // if (typeof elephant.affiliation === 'string') {
        eQuiz.locationList.push(elephant.affiliation);
        // }
    });
}
/////////////////////////////

eQuiz.getNames = function() {
    eQuiz.gatherNameList();
    eQuiz.namesAns = [];
    // shuffle namesList and put it into namesAns
    eQuiz.shuffle(eQuiz.namesAns, eQuiz.namesList);
    // filter: so namesAnswer will include all names without the correct name
    eQuiz.namesAns = eQuiz.namesAns.filter(function(item){
        return item !== eQuiz.shuffledE[eQuiz.qNum].name
    });
    // slice out the first 3 random names from namesAns
    eQuiz.namesAns = eQuiz.namesAns.slice(0, 3);
    //grab correct elephant name and put into namesAns
    eQuiz.namesAns.push(eQuiz.shuffledE[eQuiz.qNum].name);
    // shuffle namesAns and put it into ansArray
    eQuiz.shuffle(eQuiz.ansArray, eQuiz.namesAns);
    // variable for the right answer to use later
    eQuiz.correctAns = eQuiz.shuffledE[eQuiz.qNum].name;
}

eQuiz.getLocations = function() {
    eQuiz.gatherLocationList();
    eQuiz.locationAns = [];
    eQuiz.shuffle(eQuiz.locationAns, eQuiz.locationList);
    eQuiz.locationAns = eQuiz.locationAns.filter(function (item) {
        return item !== eQuiz.shuffledE[eQuiz.qNum].affiliation;
    });
    eQuiz.locationAns = eQuiz.locationAns.slice(0, 3);
    eQuiz.locationAns.push(eQuiz.shuffledE[eQuiz.qNum].affiliation);
    eQuiz.shuffle(eQuiz.ansArray, eQuiz.locationAns);
    eQuiz.correctAns = eQuiz.shuffledE[eQuiz.qNum].affiliation;
}



eQuiz.ansHtmlToAdd = function() {
    eQuiz.ansHtml = '';
    eQuiz.ansArray.forEach(function(item) {
        eQuiz.ansHtml += `<input type="radio" name="answer" id="${item}" value="${item}" required>
            <label for="${item}">${item}</label>`;
    });
}

//html section
eQuiz.compileHtmlDom = function() {
    const formToAdd = `
        <div class="headerContainer">
            <h3>${eQuiz.currentQ}</h3>
        </div>
        <div class="questionLayout">
            <div class="questionImage">
                <img src="${eQuiz.shuffledE[eQuiz.qNum].image}" alt="">
            </div>
            <div class="answerLayout">
                ${eQuiz.ansHtml}
            </div>
        </div>
        <div class="buttonContainer">
            <button type="submit" class="next">Next</button>
        </div>
    `;
    //put on DOM
    eQuiz.$questionForm.html(formToAdd);
    eQuiz.$hintToaster.text(eQuiz.hintText);
}

eQuiz.endQuiz = function() {
    if(eQuiz.score === 0) {
        eQuiz.message = "You should probably go visit the zoo next weekend.";
    } else if (eQuiz.score < 5) {
        eQuiz.message = "Life isn't perfect. Try harder next time.";
    } else if (eQuiz.score === 5) {
        eQuiz.message = "You're an elephant whisperer!";
    } else {
        eQuiz.message = "Sorry you broke our score system :(";
    }
    eQuiz.$qScreen.hide();
    const htmlToAdd = `
        <div class="scoreContainer">
            <h3>Congratulations!</h3>
            <p>Your score was: <span class="scoreEmphasis">${eQuiz.score}/5</span></p>
            <p>${eQuiz.message}</p>
            <div class="scoreButtonContainer">
                <a href="https://twitter.com/intent/tweet?text=I%20just%20took%20the%20elephant%20quiz%20and%20I%20got%20${eQuiz.score / 5 * 100}%25.%20Test%20your%20elephant%20knowledge%20here:%20https://cecile-stephanie.github.io/elephantQuiz/%20%23junocollege%20%40cclzhang%20%40stephqqmore" tabindex="-1"><button class="twitter-share-button"><i class="fab fa-twitter"></i> Tweet</button></a>
                <button class="reset">Play Again</button>
            </div>
            <a href="https://tinyurl.com/wqwmyys" class="saveTheElephants" target="_blank">Stop Wildlife Crime</a>
        </div>
    `;
    eQuiz.$scoreScreen.show().html(htmlToAdd);
    //shuffle elephants in preparation for new game
    eQuiz.shuffleE();
    eQuiz.reset();
}

eQuiz.shuffleE = function() {
    //randomize array of elephants
    eQuiz.shuffledE = [];
    eQuiz.shuffle(eQuiz.shuffledE, eQuiz.arrayOfE);
}

eQuiz.reset = function() {
    eQuiz.$scoreScreen.on("click", ".reset", function () {
        eQuiz.qNum = 0;
        eQuiz.score = 0;
        eQuiz.$scoreScreen.hide();
        eQuiz.startQuiz();
    });
}