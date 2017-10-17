//Chequea si es una posible rule o fact
function Isrule(){
    this.substring = ":-";
    this.isRule = function(line) {return line.includes(this.substring)}
}

//Devuelve si es una rulex valida
function Isavalidrule(){
    this.regex = /.*\(.*\) :- .*\(.*\)\.$/
    this.isValidRule = function(line) {return this.regex.test(line)}
}

//Devuelve si es un fact valido
function Isavalidfact(){
    this.regex = /.*\(.*\)\.$/
    this.isValidFact = function(line) {return this.regex.test(line)}
}

function Query(){
    this.isvalid = function(query){
        var regex = /.*\(.*\)/;
        return regex.test(query)}
    this.name = function(query){return query.replace(/\(.*\)/,"")}
    this.arguments = function(query){
        var aux = query.replace(/.*\(/,"");
        var aux2 = aux.replace(/\)/,"");
        var aux3 = aux2.replace(/ /g,"");
        return aux3.split(","); }
}

//Guarda los argumentos de los facts y devuelve si contiene o no determinados argumentos.
function Facts(){
    this.arguments = [];
    this.len = 0;
    this.appendArguments = function(argument){this.arguments.push(argument); this.len++;}
    this.contain = function(argument){
      var lenaux = argument.length;
      var bool;
      if (this.len === 0) { return false; }
      if (this.arguments[0].length != lenaux){ return false; }
      for(var x in this.arguments){
        bool = true;
        for (var y = 0; y < lenaux; y++ )
          if(this.arguments[x][y] != argument[y]){
            bool = false;
            break;
          }
        if(bool) return bool;
      }
      return bool;
    }
}


//Obtiene nombre y argumentos de un fact.
function Parserfacts() {
  this.name = function(fact){ return fact.replace(/\(.*$/,""); }
  this.arguments = function(fact){
    var aux = fact.replace(/.*\(/,"");
    var aux2 =aux.replace(/\)\./,"");
    var aux3 = aux2.replace(/ /g,"");
    return aux3.split(","); }
}

//Obtiene nombre, argumentos y facts de una rule.
function Parserinforules(){
  this.name = function(rule){ return rule.replace(/\(.*$/,""); }
  this.arguments = function(rule){
    var aux = rule.replace(/\).*$/,"");
    var aux2 = aux.replace(/.*\(/,"");
    var aux3 = aux2.replace(/ /g,"");
    return aux3.split(","); }
  this.facts = function(rule){
    var aux = rule.replace(/.*:-/,"");
    var aux2 = aux.replace(/ /g,"");
    var aux3 = aux2.replace(/\)\./,")");
    var aux4 = aux3.replace(/\)\,/,") ");
    return aux4.split(" ");
  }
}

//Chequea si la rule cumple.
function Checkrule(facts, rules){
  var parserinforules = new Parserinforules();
  var parserfact = new Query(); //Los facts tienen forma de query y no de facts.
  this.checkrule = function(rule){
    var name = parserinforules.name(rule);
    var argumentofrule = parserinforules.arguments(rule);
    var value;
    var argument;
    var ruletocheck;
    var fact;
    var factstocheck;
    var bool = true;
    if (!rules.has(name)){
      return false;
    } else {
      value = rules.get(name);
      ruletocheck = value[1];
      argument = value[0];
      if(argument.length != argumentofrule.length) return false;


      for (var x in argument){
        ruletocheck = ruletocheck.replace(new RegExp(argument[x], 'g'),argumentofrule[x])
      }

      factstocheck = parserinforules.facts(ruletocheck);
      for (var x in factstocheck){
        fact = factstocheck[x];
        if(!parserfact.isvalid(fact)){
            bool = false;
            break;
        }
        name = parserfact.name(fact);
        if(!facts.has(name)){
            bool = false;
            break;
        }
        argument = parserfact.arguments(fact);
        if(!facts[name].contain(argument)){
            bool = false;
            break;
        }
      }
      return bool;
    }
  }
}

var Interpreter = function () {

    this.isrule = new Isrule();

    this.validfact = new Isavalidfact();
    this.parserfact = new Parserfacts();

    this.validrule = new Isavalidrule();
    this.parserinforules = new Parserinforules();
    this.checkrule;

    this.query = new Query();

    this.facts = new Map();
    this.rules = new Map();

    this.validdb = true;

    this.parseDB = function (params) {
        var len = params.length;
        var line;
        var name;
        var argument;
        for(i = 0; i < len && this.validdb ; i++){
            line = params[i];
            if (this.isrule.isRule(line)){
                if(this.validrule.isValidRule(line)){
                    name = this.parserinforules.name(line);
                    argument = this.parserinforules.arguments(line);
                    this.rules.set(name,[argument,line]);
                } else {
                    this.validdb = false;
                }
            } else {
                if(this.validfact.isValidFact(line)){
                    name = this.parserfact.name(line);
                    argument = this.parserfact.arguments(line);
                    if (this.facts.has(name)){
                        this.facts[name].appendArguments(argument);
                    } else {
                        this.facts.set(name,1);
                        this.facts[name] = new Facts();
                        this.facts[name].appendArguments(argument);
                    }
                } else {
                    this.validdb = false;
                }
            }
        }
    }

    this.checkQuery = function (params) {

        var name;
        var argument;

        if (!this.validdb){
            return false;
        }
        if(!this.query.isvalid(params)){
            return false;
        } else {
            name = this.query.name(params);
            if (!this.facts.has(name)){
                if(!this.rules.has(name)){
                    return false;
                } else {
                    this.checkrule = new Checkrule(this.facts,this.rules);
                    return this.checkrule.checkrule(params);
                }
            } else {
                argument = this.query.arguments(params);
                return this.facts[name].contain(argument);
            }
        }
        return true;
    }

}

module.exports = Interpreter;
