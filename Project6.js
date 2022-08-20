


// final function
function interpExpression(state, e) {
  return interpExpressionHelper(state, e);
}

// handles all cases from expression tree
function interpExpressionHelper(state, e) {
    if(e.kind === 'number') { 
      return e.value;
    }
    if(e.kind === 'boolean') {
      return e.value;
    }
    if(e.kind === 'variable') {
      let scope = getScope(state, e.name);
      return lib220.getProperty(scope, e.name).value;
    }
    else if(e.kind === 'operator') {
      if(e.op === '+') {
        let res = calcExpression(e, state, 'number');
        return res.one + res.two;
      }
      if(e.op === '-') {
        let res = calcExpression(e, state, 'number');
        return res.one - res.two;
      }
      if(e.op === '*') {
        let res = calcExpression(e, state, 'number');
        return res.one * res.two;
      }
      if(e.op === '/') {
        let res = calcExpression(e, state, 'number');
        return res.one / res.two;
      }
      if(e.op === '>') {
        let res = calcExpression(e, state, 'number');
        return res.one > res.two;
      }
      if(e.op === '<') {
        let res = calcExpression(e, state, 'number');
        return res.one < res.two;
      }
      if(e.op === '&&') {
        let res = calcExpression(e, state, 'boolean');
        return res.one && res.two;
      }
      if(e.op === '||') {
        let res = calcExpression(e, state, 'boolean');
        return res.one || res.two;
      }
      if(e.op === '===') {
        return interpExpressionHelper(state, e.e1) === interpExpressionHelper(state, e.e2);
    }
    else { assert(false); }
}


}
function recurTemp(e, state) {
  let v1 = interpExpressionHelper(state, e.e1);
  let v2 = interpExpressionHelper(state, e.e2);
  return { one: v1, two: v2};
}

function checkTypes(v1, v2, type) {
  return typeof(v1) !== type || typeof(v2) !== type ? true : false;
}

// calculates mathematical expression
function calcExpression(e,state,type) {
  let tmp = recurTemp(e, state);
  let v1 = tmp.one;
  let v2 = tmp.two;
  if(checkTypes(v1,v2,type)) {
    console.log('Both arguments must be of type ' + type);
    assert(false);
  }
  return tmp;
}

// interpProgram
function interpProgram(p) {
  let state = {};
  p.forEach(e => interpStatement(state, e));
  return state;
}
// modifies state in-place
function interpStatement(state, stmt) {
  switch(stmt.kind) {
  case 'assignment': { // don’t forget break; or return; !!!
    let curScope = getScope(state, stmt.name);
    lib220.setProperty(curScope, stmt.name, interpExpression(curScope, stmt.expression));
    break;
  }
  case 'let': {
    if(lib220.getProperty(state, stmt.name).found === true) {
      console.log('Cannot redeclare ' + stmt.name)
      assert(false);
    }
    lib220.setProperty(state, stmt.name, interpExpression(state, stmt.expression));
    break;
  }
  case 'print': {
    if(stmt.expression.kind === 'variable') {
      let curScope = getScope(state, stmt.expression.name);
      console.log(lib220.getProperty(curScope, stmt.expression.name).value);
      break;
    } 
    else {
      console.log(interpExpression(state, stmt.expression));
    }
  }
  case 'if': {
    let testRes = interpExpression(state, stmt.test);
    if(typeof(testRes) !== 'boolean') {
      console.log('Condition must be type boolean');
      assert(false);
    }
    if(testRes) {
      interpBlock({nextScope: state}, stmt.truePart);
    }
    else {
      interpBlock({nextScope: state}, stmt.falsePart);
    }
    break;
  }
  case 'while': {
    let testRes = interpExpression(state, stmt.test);
    if(typeof(testRes) !== 'boolean') {
      console.log('Condition must be type boolean');
      assert(false);
    }
    whileHelper(state, stmt);
    break;
  }
  // default: // error: unknown kind
}

//small test case
let p = parser.parseProgram("let x = 10; if(x === 10){ let z = 20; print(x); } else{ let y = 5; }").value;
//p[1].truePart[0].name="x";

}

function interpBlock(state, b) {
  b.forEach(e => interpStatement(state, e));
}

function whileHelper(state, stmt) {
  if(!interpExpression(state, stmt.test)) {
    return;
  }
  else {
    interpBlock(state, stmt.body);
    whileHelper(state, stmt);
  }
}
//statements to test
let state1 = {};
let state2 = {x: 6, y: 8};
let stmt1 = {
      kind: "let",
      name: "x",
      expression: {
        kind: "number",
        value: 8
      }
    };
let stmt2 = {
      kind: "print",
      expression: {
        kind: "number",
        value: 4
      }
    };
let stmt3 = {
      kind: "print",
      expression: {
        kind: "variable",
        name: "y"
      }
    };

let stmt4 = {
      kind: "assignment",
      name: "x",
      expression: {
        kind: "number",
        value: 7
  } };

let stmt5 = {
      kind: "assignment",
      name: "x",
      expression: {
        kind: "operator",
        op: "-",
        e1: {
          kind: "number",
          value: 4
        },
        e2: {
          kind: "number",
          value: 5
        }
      }
    };

let stmt6 = {
      kind: "if",
      test: {
        kind: "operator",
        op: ">",
        e1: {
          kind: "variable",
          name: "x"
        },
        e2: {
          kind: "number",
          value: 3
        }
      },
      truePart: [
        {
          kind: "assignment",
          name: "y",
          expression: {
            kind: "operator",
            op: "+",
            e1: {
              kind: "variable",
              name: "y"
            },
            e2: {
              kind: "variable",
              name: "x"
            }
          }
        }
      ],
      falsePart: [
        {
          kind: "assignment",
          name: "y",
          expression: {
            kind: "operator",
            op: "+",
            e1: {
              kind: "variable",
              name: "y"
            },
            e2: {
              kind: "number",
              value: 1
            }
          }
        }
      ]
} 
// interpStatement(state1, stmt1);
// interpStatement(state1, stmt2);
// interpStatement(state1, stmt3);

function getScope(cur, variable) {
  let curScope = cur;
  let found = false;
  while(!found) {
    if(lib220.getProperty(curScope, variable).found === true) {
      break;
    } 
    if(lib220.getProperty(curScope, 'nextScope').found === false) {
      console.log('Error: ' + variable + ' not found');
      assert(false);
    }
    curScope = curScope.nextScope;
  }
  return curScope;
}
let scopeOne = {y: 9, f: true};
let scopeOuter = {x: 6, u: 5, nextScope: scopeOne };
let scopeInner = {nextScope: scopeOuter, u: 6, n: false};
