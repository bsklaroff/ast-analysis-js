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
  var programSpec, editor;
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

  var genAddListItem = function(listName) {
    return function(e, ui) {
      var i, nodeType = ui.item.label;
      e.preventDefault();
      $('.list_input').val('');

      if (listName === 'blacklist' || listName === 'whitelist') {
        programSpec[listName].push(nodeType);
      } else {
        if (programSpec['structureList'].indexOf(nodeType) === -1) {
          programSpec['structureList'].push(nodeType);
        }
        // Handle structure nodes
      }
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

      refreshLists();
      refreshAutocompletes();
    };
  };

  var refreshLists = function() {
    var i, nodeType;
    $('#whitelist_list').empty();
    $('#blacklist_list').empty();
    $('#structure_list').empty();
    for (i = 0; i < programSpec['whitelist'].length; i++) {
      nodeType = programSpec['whitelist'][i];
      $('#whitelist_list').append('<div>' + nodeType + '</div>');
    }
    for (i = 0; i < programSpec['blacklist'].length; i++) {
      nodeType = programSpec['blacklist'][i];
      $('#blacklist_list').append('<div>' + nodeType + '</div>');
    }
    for (i = 0; i < programSpec['structureList'].length; i++) {
      nodeType = programSpec['structureList'][i];
      $('#structure_list').append('<div>' + nodeType + '</div>');
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
  refreshAutocompletes();

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
