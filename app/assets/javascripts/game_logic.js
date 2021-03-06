$(document).ready(function() {
  //add explore handlers
  addExploreHandler('subq');
  addExploreHandler('subc');
  addExploreHandler('subf');
  addExploreHandler('dowq');
  addExploreHandler('dowc');
  addExploreHandler('dowf');
  addExploreHandler('whaq');
  addExploreHandler('whac');
  addExploreHandler('whaf');
  findNewLocHandler('sube');
  findNewLocHandler('dowe');
  findNewLocHandler('whae');

  //remove EoT effects
  function clearEndofTurn(){
    untilEndofTurn.modAttack = 0;
    untilEndofTurn.modActions = 0;
    untilEndofTurn.modReckless = 0;
    untilEndofTurn.modThorough = 0;
    untilEndofTurn.modZombieStrength = 0;
    actionsLeft = actions;
  }

  //function to add explore handlers
  function addExploreHandler(id){
    $('#'+id+'').on('click', exploreHere);
  }
  //function to add new location handlers
  function findNewLocHandler(id){
    $('#'+id+'').on('click', findNewLoc);
  }

  //random int function
  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  //update the stats sidebar view with current player values
  function updatePlayerStatsView(){
    $('#sidebar-turns').html(gameState.turns);
    $('#sidebar-food').html(gameState.food);
    $('#sidebar-morale').html(gameState.morale);
    $('#sidebar-shelter').html(gameState.shelter);
    $('#sidebar-tools').html(gameState.tools);
    $('#sidebar-common').html(gameState.mat.common);
    $('#sidebar-uncommon').html(gameState.mat.uncommon);
    $('#sidebar-rare').html(gameState.mat.rare);
  }
  //update away party stats
  function updatePartyStatsView(){
    $('#partyattack').html(attack);
    $('#partyactions').html(actionsLeft);
    $('#partyreckless').html(reckless);
    $('#partythorough').html(thorough);
  }

  //show a new location
  function showNewLocation(district, alldistrict){
    //get a random location
    var min = 0
    var max = alldistrict.length - 1
    var idx = getRandomInt(min, max)
    var locObj = alldistrict[idx]

    //store as current loc variable
    if(district === "suburbs"){
      currentSuburbs = locObj;
    }
    else if(district === "downtown"){
      currentDowntown = locObj;
    }
    else{
      currentWharf = locObj;
    }

    //update correct view with this location
    // $('#'+district+' .locationimg').attr('src', locObj.imgtag);
    $('#'+district+' .locname').html(locObj.name);
    $('#'+district+' .qmin').html(locObj.fastmin);
    $('#'+district+' .qmax').html(locObj.fastmax);
    $('#'+district+' .cmin').html(locObj.medmin);
    $('#'+district+' .cmax').html(locObj.medmax);
    $('#'+district+' .fmin').html(locObj.slowmin);
    $('#'+district+' .fmax').html(locObj.slowmax);
    $('#'+district+' .flavtxt').html(locObj.flavortext);
  }

  //show a new Event
  function newEvent(){
    //get random event
    var min = 0
    var max = gameState.allEvents.length - 1
    var idx = getRandomInt(min, max)
    var event = gameState.allEvents[idx]

    $('#currentevent .eventname').html('Event: ' + event.name);
    $('#currentevent .eventtxt').html(event.flavortext);
    $('#currentevent .eventeffect').html('End of Turn => '+event.effect);
  }

  //explore
  function exploreHere(){
    //consume 1 action
    actionsLeft -= 1
    updatePartyStatsView();
    //find current explore diff, quick, cautious, or full
    currentExploreDiff = $(this).parent().parent().attr('class');

    //find location
    var firstThreeId = $(this).attr('id').substr(0,3);
    if(firstThreeId === "sub"){
      currentDistrict = "suburbs";
      currentLocation = currentSuburbs;
    }
    else if(firstThreeId === "dow"){
      currentDistrict = "downtown";
      currentLocation = currentDowntown;
    }
    else {
      currentDistrict = "wharf";
      currentLocation = currentWharf;
    }
    printLog('Searching '+currentLocation.name+'...');

    //find fight values here
    var zmin;
    var zmax;
    var numRewards;//up to 2 for quick, 4 for cautious, 6 full
    if(currentExploreDiff === 'quick'){
      zmin = currentLocation.fastmin;
      zmax = currentLocation.fastmax;
      numRewards = getRandomInt(0,2);
    }
    else if(currentExploreDiff === 'cautious'){
      zmin = currentLocation.medmin;
      zmax = currentLocation.medmax;
      numRewards = getRandomInt(0,4);
    } else {
      zmin = currentLocation.slowmin;
      zmax = currentLocation.slowmax;
      numRewards = getRandomInt(0,6);
    }

    setTimeout(function(){fightZombies(zmin, zmax, numRewards)}, 1500);
  }

  //combat
  function fightZombies(min, max, num){
    //add player attack and temp mods
    var finalAtk = attack + untilEndofTurn.modAttack;
    //add random zombie roll plus mods
    z = getRandomInt(min, max);
    var finalZ = z + untilEndofTurn.modZombieStrength;
    //combat
    if(finalAtk >= finalZ){
      //success, add items to backpack
      printLog('Zombies defeated, found '+num+' items!');
      setTimeout(function(){findItems(currentDistrict, num)}, 1000);
    }
    else{
      //fail, get nothing
      printLog('Too many zombies, you run for your life emptyhanded.');
    }
  }

  function findItems(district, num){
    //set up district decks
    var here;
    var there1;
    var there2;
    if(district === "suburbs"){
      here = suburbItems;
      there1 = downtownItems;
      there2 = wharfItems;
    }
    else if(district === "downtown"){
      here = downtownItems;
      there1 = suburbItems;
      there2 = wharfItems;
    } else {
      here = wharfItems;
      there1 = suburbItems;
      there2 = downtownItems;
    }
    //chances = 2 for own district, 2 for universal, 1 each for other district or recipe
    for(var items = 0; items < num; items++){
      //get random item category
      var cat = getRandomInt(0,6);
      //get recipes
      if(cat === 0){
        var r = gameRecipes[getRandomInt(0,gameRecipes.length - 1)];
        printLog('you found recipe: '+r.name);
        backpack.push(r);
      }
      //get universal items
      else if(cat === 1 || cat === 2){
        var i = universalItems[getRandomInt(0,universalItems.length - 1)];
        printLog('you found: '+i.name);
        backpack.push(i);
      }
      //get district items
      else if(cat === 3 || cat === 4){
        var i = here[getRandomInt(0,here.length - 1)];
        printLog('you found: '+i.name);
        backpack.push(i);
      }
      //get other 2 district items
      else if(cat === 5) {
        var i = there1[getRandomInt(0,there1.length - 1)];
        printLog('you found: '+i.name);
        backpack.push(i);
      }
      else if(cat === 6){
        var i = there2[getRandomInt(0,there2.length - 1)];
        printLog('you found: '+i.name);
        backpack.push(i);
      }
    }
    console.log(backpack);
  }

  function findNewLoc(){
    //consume 1 action
    actionsLeft -= 1
    updatePartyStatsView();
    //get new location
    var firstThreeId = $(this).attr('id').substr(0,3);
    if(firstThreeId === "sub"){
      showNewLocation("suburbs", allsuburbs);
      printLog('Found a new place in the suburbs.');
    }
    else if(firstThreeId === "dow"){
      showNewLocation("downtown", alldowntown);
      printLog('Found a new place downtown');
    } else {
      showNewLocation("wharf", allwharf);
      printLog('Found a new place at the wharf');
    }
  }

  //print message to game log
  function printLog(string){
    if($('.gamelog tr').length === maxMessages){
      $('.gamelog tr:nth-child(1)').remove();
    }
    $('#gameMsg').append('<tr><td>'+string+'</td></tr>');
    $('.gamelog').scrollTop($('.gamelog')[0].scrollHeight);
  }

  //******* BEGIN GAME *********
  //initialize game stats and stat views
  initGameState();
  updatePlayerStatsView();
  updatePartyStatsView();
  //deal starting 3 locations
  showNewLocation("suburbs", allsuburbs);
  showNewLocation("downtown", alldowntown);
  showNewLocation("wharf", allwharf);
  //get an event
  newEvent();
})
