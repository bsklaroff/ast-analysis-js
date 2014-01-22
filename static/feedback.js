var nodeTypes = [
  'Program',
  'Function',
  'Statement',
  'EmptyStatement',
  'BlockStatement',
  'ExpressionStatement',
  'IfStatement',
  'LabeledStatement',
  'BreakStatement',
  'ContinueStatement',
  'WithStatement',
  'SwitchStatement',
  'ReturnStatement',
  'ThrowStatement',
  'TryStatement',
  'WhileStatement',
  'DoWhileStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'LetStatement',
  'DebuggerStatement',
  'Declaration',
  'FunctionDeclaration',
  'VariableDeclaration',
  'VariableDeclarator',
  'Expression',
  'ThisExpression',
  'ArrayExpression',
  'ObjectExpression',
  'FunctionExpression',
  'ArrowExpression',
  'SequenceExpression',
  'UnaryExpression',
  'BinaryExpression',
  'AssignmentExpression',
  'UpdateExpression',
  'LogicalExpression',
  'ConditionalExpression',
  'NewExpression',
  'CallExpression',
  'MemberExpression',
  'YieldExpression',
  'ComprehensionExpression',
  'GeneratorExpression',
  'GraphExpression',
  'GraphIndexExpression',
  'LetExpression',
  'Pattern',
  'ObjectPattern',
  'ArrayPattern',
  'SwitchCase',
  'CatchClause',
  'ComprehensionBlock',
  'Identifier',
  'Literal'
];

$(function() {
  var programSpec, editor, updateTimer, nextStructId = 1;
  programSpec = {
    whitelist: [],
    blacklist: [],
    structure: [],
    structureList: [],
    nonBlacklistNodes: nodeTypes,
    nonWhiteBlacklistNodes: nodeTypes,
    nonListNodes: nodeTypes
  };
  editor = ace.edit('editor');
  editor.setTheme('ace/theme/monokai');
  editor.getSession().setMode('ace/mode/javascript');
  editor.on('change', function() {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(updateFeedback, 500);
  });

  var matchChildren = function(node, structure) {
    var i, v, keys;
    keys = Object.keys(node);
    for (i = 0; i < keys.length; ++i) {
      v = node[keys[i]];
      if (!v) continue;
      if (v instanceof Array && matchStructure(v, structure)) {
        return true;
      }
      if (typeof v === 'object' && matchStructure([v], structure)) {
        return true;
      }
    }
    return false;
  };

  var matchStructure = function(nodeList, structure) {
    var i = 0, j = 0;
    while (i < structure.length && j < nodeList.length) {
      if (nodeList[j].type !== undefined &&
          nodeList[j].type === structure[i].nodeType &&
          matchChildren(nodeList[j], structure[i].children)) {
        i++;
      }
      j++;
    }
    if (i === structure.length) {
      return true;
    } else {
      for (j = 0; j < nodeList.length; j++) {
        if (matchChildren(nodeList[j], structure)) {
          return true;
        }
      }
    }
    return false;
  };

  var getNodeNames = function(ast, nodeList) {
    var i;
    if (nodeList.indexOf(ast.type) === -1) {
      nodeList.push(ast.type);
    }
    for (i = 0; i < ast.body.length; i++) {
      getNodeNames(ast.body[i], nodeList);
    }
  };

  var updateFeedback = function() {
    var i, ast, nodeName, allGood, nodeList = [], nodeNameVisitors = {};
    var getNodeNames = function(node) {
      if (nodeList.indexOf(node.type) === -1) {
        nodeList.push(node.type);
      }
    };
    for (i = 0; i < nodeTypes.length; i++) {
      nodeNameVisitors[nodeTypes[i]] = getNodeNames;
    }
    ast = acorn.parse_dammit(editor.getValue());
    acorn.walk.simple(ast, nodeNameVisitors);

    allGood = true;
    for (i = 0; i < programSpec['whitelist'].length; i++) {
      nodeName = programSpec['whitelist'][i];
      if (nodeList.indexOf(nodeName) === -1) {
        allGood = false;
        $('#whitelist_' + nodeName).removeClass('green');
        $('#whitelist_' + nodeName).addClass('red');
      } else {
        $('#whitelist_' + nodeName).removeClass('red');
        $('#whitelist_' + nodeName).addClass('green');
      }
    }
    if (allGood) {
      $('#whitelist_list').removeClass('red');
      $('#whitelist_list').addClass('green');
    } else {
      $('#whitelist_list').removeClass('green');
      $('#whitelist_list').addClass('red');
    }

    allGood = true;
    for (i = 0; i < programSpec['blacklist'].length; i++) {
      nodeName = programSpec['blacklist'][i];
      if (nodeList.indexOf(nodeName) !== -1) {
        allGood = false;
        $('#blacklist_' + nodeName).removeClass('green');
        $('#blacklist_' + nodeName).addClass('red');
      } else {
        $('#blacklist_' + nodeName).removeClass('red');
        $('#blacklist_' + nodeName).addClass('green');
      }
    }
    if (allGood) {
      $('#blacklist_list').removeClass('red');
      $('#blacklist_list').addClass('green');
    } else {
      $('#blacklist_list').removeClass('green');
      $('#blacklist_list').addClass('red');
    }

    if (matchStructure([ast], programSpec['structure'])) {
      $('#structure_list').removeClass('red');
      $('#structure_list').addClass('green');
    } else {
      $('#structure_list').addClass('red');
      $('#structure_list').removeClass('green');
    }
  };

  var computeStructList = function(nodeList, allStructIds, topLevel) {
    var i, nodeType;
    if (topLevel) {
      programSpec['structureList'] = [];
    }
    for (i = 0; i < nodeList.length; i++) {
      nodeType = nodeList[i]['nodeType'];
      allStructIds.push(nodeList[i]['id']);
      if (programSpec['structureList'].indexOf(nodeType) === -1) {
        programSpec['structureList'].push(nodeType);
      }
      computeStructList(nodeList[i]['children'], allStructIds, false);
    }
    if (topLevel) {
      allStructIds.sort();
      nextStructId = 1;
      for (i = 0; i < allStructIds.length; i++) {
        if (allStructIds[i] === nextStructId) {
          nextStructId++;
        } else {
          break;
        }
      }
    }
  };

  var genAddListItem = function(listName) {
    return function(e, ui) {
      var i, allStructIds, nodeType = ui.item.label;
      e.preventDefault();
      $('.list_input').val('');

      if (listName === 'structure') {
        if (programSpec['structure'].length === 0) {
          programSpec['structure'].push({
            id: nextStructId,
            nodeType: nodeType,
            children: []
          });
          computeStructList(programSpec['structure'], [], true);
          refreshListUI();
        } else {
          $('#structure_node_name').text(nodeType);
          $('#structure_node_modal').modal('show');
        }

      } else {
        programSpec[listName].push(nodeType);
        refreshListUI();
      }
    };
  };

  var refreshNonLists = function() {
    programSpec['nonBlacklistNodes'] = [];
    programSpec['nonWhiteBlacklistNodes'] = [];
    programSpec['nonListNodes'] = [];
    for (i = 0; i < nodeTypes.length; i++) {
      if (programSpec['blacklist'].indexOf(nodeTypes[i]) === -1) {
        programSpec['nonBlacklistNodes'].push(nodeTypes[i]);
        if (programSpec['whitelist'].indexOf(nodeTypes[i]) === -1) {
          programSpec['nonWhiteBlacklistNodes'].push(nodeTypes[i]);
          if (programSpec['structureList'].indexOf(nodeTypes[i]) === -1) {
            programSpec['nonListNodes'].push(nodeTypes[i]);
          }
        }
      }
    }
  };

  var refreshAutocompletes = function() {
    $('#whitelist_input').autocomplete({
      source: programSpec['nonWhiteBlacklistNodes'],
      select: genAddListItem('whitelist')
    });
    $('#blacklist_input').autocomplete({
      source: programSpec['nonListNodes'],
      select: genAddListItem('blacklist')
    });
    $('#structure_input').autocomplete({
      source: programSpec['nonBlacklistNodes'],
      select: genAddListItem('structure')
    });
  };

  var refreshStructureUI = function(topNode) {
    var i, structureNode;
    for (i = 0; i < topNode['children'].length; i++) {
      structureNode = topNode['children'][i];
      $('#structure_' + topNode['id']).append(
        '<div id="structure_' + structureNode['id'] +
        '" class="list_node">' + structureNode['nodeType'] +
        '<button class="close">&times</button></div>'
      );
      $('#chooser_' + topNode['id']).append(
        '<button class="btn btn-xs chooser-btn">Add Here</button>'
      );
      $('#chooser_' + topNode['id']).append(
        '<div id="chooser_' + structureNode['id'] + '" class="list_node">' +
        structureNode['nodeType'] + '</div>'
      );
      refreshStructureUI(structureNode);
    }
    $('#chooser_' + topNode['id']).append(
      '<button class="btn btn-xs chooser-btn">Add Here</button>'
    );
  };

  var refreshListUI = function() {
    var i, nodeType, structureNode;
    $('#whitelist_list').empty();
    $('#blacklist_list').empty();
    $('#structure_list').empty();
    $('#structure_node_chooser').empty();
    for (i = 0; i < programSpec['whitelist'].length; i++) {
      nodeType = programSpec['whitelist'][i];
      $('#whitelist_list').append(
        '<div id="whitelist_' + nodeType + '" class="list_node">' +
        nodeType + '<button class="close">&times</button></div>'
      );
    }
    for (i = 0; i < programSpec['blacklist'].length; i++) {
      nodeType = programSpec['blacklist'][i];
      $('#blacklist_list').append(
        '<div id="blacklist_' + nodeType + '" class="list_node">' +
        nodeType + '<button class="close">&times</button></div>'
      );
    }
    for (i = 0; i < programSpec['structure'].length; i++) {
      structureNode = programSpec['structure'][i];
      $('#structure_list').append(
        '<div id="structure_' + structureNode['id'] +
        '" class="list_node">' + structureNode['nodeType'] +
        '<button class="close">&times</button></div>'
      );
      $('#structure_node_chooser').append(
        '<button class="btn btn-xs chooser-btn">Add Here</button>'
      );
      $('#structure_node_chooser').append(
        '<div id="chooser_' + structureNode['id'] + '" class="list_node">' +
        structureNode['nodeType'] + '</div>'
      );
      refreshStructureUI(structureNode);
    }
    $('#structure_node_chooser').append(
      '<button class="btn btn-xs chooser-btn">Add Here</button>'
    );
    refreshNonLists();
    refreshAutocompletes();
    updateFeedback();
  };

  refreshListUI();

  var removeStructureNode = function(nodeList, targetId) {
    var i;
    for (i = 0; i < nodeList.length; i++) {
      if (nodeList[i]['id'] === targetId) {
        nodeList.splice(i, 1);
        return true;
      }
      if (removeStructureNode(nodeList[i]['children'], targetId)) {
        return true;
      }
    }
    return false;
  };

  $('.node_list').on('click', '.close', function(e) {
    var nodeDiv, splitId, listName, nodeType, idx;
    nodeDiv = $(e.currentTarget).parent();
    splitId = nodeDiv.attr('id').split('_');
    listName = splitId[0];
    nodeType = splitId[1];

    if (listName === "structure") {
      removeStructureNode(programSpec['structure'], parseInt(nodeType));
      computeStructList(programSpec['structure'], [], true);
    } else {
      idx = programSpec[listName].indexOf(nodeType);
      if (idx !== -1) {
        programSpec[listName].splice(idx, 1);
      }
    }

    refreshListUI();
  });

  var addStructureNode = function(curId, children, parentId, prevId) {
    var i, c, newNode;
    if (curId === parentId) {
      newNode = {
        id: nextStructId,
        nodeType: $('#structure_node_name').text(),
        children: []
      };
      if (prevId === 0) {
        children.splice(0, 0, newNode);
        return true;
      }
      for (i = 0; i < children.length; i++) {
        if (children[i]['id'] === prevId) {
          children.splice(i + 1, 0, newNode);
          return true;
        }
      }
    } else {
      for (i = 0; i < children.length; i++) {
        c = children[i];
        if (addStructureNode(c['id'], c['children'], parentId, prevId)) {
          return true;
        }
      }
    }
    return false;
  };

  $('#structure_node_chooser').on('click', '.chooser-btn', function(e) {
    var chosenDiv, parentDiv, prevDiv, parentId = 0, prevId = 0;
    chosenDiv = $(e.currentTarget);
    parentDiv = chosenDiv.parent();
    if (parentDiv.attr('id') !== 'structure_node_chooser') {
      parentId = parseInt(parentDiv.attr('id').split('_')[1]);
    }
    prevDiv = chosenDiv.prev();
    if (prevDiv.length !== 0) {
      prevId = parseInt(prevDiv.attr('id').split('_')[1]);
    }
    addStructureNode(0, programSpec['structure'], parentId, prevId);
    computeStructList(programSpec['structure'], [], true);

    $('#structure_node_modal').modal('hide');
    refreshListUI();
  });
});
