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
  var editor = ace.edit('editor');
  editor.setTheme('ace/theme/monokai');
  editor.getSession().setMode('ace/mode/javascript');

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
