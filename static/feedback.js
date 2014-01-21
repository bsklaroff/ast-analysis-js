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
  'Literal',
  'UnaryOperator',
  'BinaryOperator',
  'LogicalOperator',
  'AssignmentOperator',
  'UpdateOperator'
];

$(function() {
  var programSpec, editor, nextStructId = 1;
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
        '<button class="chooser-btn">Pick Me</button>'
      );
      $('#chooser_' + topNode['id']).append(
        '<div id="chooser_' + structureNode['id'] + '" class="list_node">' +
        structureNode['nodeType'] + '</div>'
      );
      refreshStructureUI(structureNode);
    }
    $('#chooser_' + topNode['id']).append(
      '<button class="chooser-btn">Pick Me</button>'
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
        '<button class="chooser-btn">Pick Me</button>'
      );
      $('#structure_node_chooser').append(
        '<div id="chooser_' + structureNode['id'] + '" class="list_node">' +
        structureNode['nodeType'] + '</div>'
      );
      refreshStructureUI(structureNode);
    }
    $('#structure_node_chooser').append(
      '<button class="chooser-btn">Pick Me</button>'
    );
    refreshNonLists();
    refreshAutocompletes();
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
  }

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

    refreshListUI();
    $('#structure_node_modal').modal('hide');
  });

  $('#submit_code').click(function() {
    $.ajax({
      type: 'GET',
      url: '/feedback',
      data: {
        code: editor.getValue()
      },
      dataType: 'json',
      success: function(data) {
        console.log(data);
      }
    });
  });
});
