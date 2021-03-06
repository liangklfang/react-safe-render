/** @jsx React.DOM */

jest.dontMock('../index');

var React = require('react/addons'),
  TestUtils = React.addons.TestUtils;

var errorHandler = jest.genMockFn();

// protect render
require('../index')(React, {
  errorHandler: errorHandler
});

errorHandler.mockImpl(function (report) {
  // console.log(report)
});

function throwIf(name, props) {
  if (props[name]) {throw new Error(name);}
}

var ExampleComponent = React.createClass({
  getInitialState: function () {
    throwIf('stateError',this.props);
    return {};
  },

  componentWillMount: function () {
    throwIf('willMountError',this.props);
  },

  componentDidMount: function () {
    throwIf('didMountError',this.props);
  },

  componentWillReceiveProps: function () {
    throwIf('recievePropsError',this.props);
  },

  shouldComponentUpdate: function () {
    throwIf('shouldUpdateError',this.props);
    return true;
  },

  componentWillUpdate: function () {
    throwIf('willUpdateError',this.props);
  },

  componentDidUpdate: function () {
    throwIf('didUpdateError',this.props);
  },

  componentWillUnmount: function () {
    throwIf('unmountError',this.props);
  },

  render: function () {
    throwIf('renderError',this.props);
    return (<div className='success'></div>);
  }
});

describe('Safe Render', function () {
  it('should return the element normally if there are no errors', function () {
    var element = (<ExampleComponent/>);
    var mounted = TestUtils.renderIntoDocument(element);
    expect(mounted.getDOMNode().className).toEqual('success');
  });

  it('should catch errors in render', function () {
    expect(function () {
      TestUtils.renderIntoDocument(<ExampleComponent renderError didMountError/>);
    }).not.toThrow();
  });

  it('should catch errors in render', function () {
    errorHandler.mockClear();

    var stub = TestUtils.renderIntoDocument(<ExampleComponent renderError/>);

    expect(errorHandler.mock.calls[0][0]).toEqual({
      displayName: 'ExampleComponent',
      method: 'render',
      props: {
        renderError: true
      },
      state: stub.getInitialState(),
      error: new Error('renderError')
    });
  });

  it('should catch errors in componentWillMount', function () {
    errorHandler.mockClear();

    var stub = TestUtils.renderIntoDocument(<ExampleComponent willMountError/>);

    expect(errorHandler).lastCalledWith({
      displayName: 'ExampleComponent',
      method: 'componentWillMount',
      props: {
        willMountError: true
      },
      state: stub.getInitialState(),
      error: new Error('willMountError')
    });
  });

  it('should catch errors in componentWillReceiveProps', function () {
    errorHandler.mockClear();

    var stub = TestUtils.renderIntoDocument(<ExampleComponent recievePropsError/>);

    stub.setState({specialFlag: true});

    stub.setProps({A: true});

    expect(errorHandler).lastCalledWith({
      displayName: 'ExampleComponent',
      method: 'componentWillReceiveProps',
      props: {
        recievePropsError: true
      },
      state: {
        specialFlag: true
      },
      arguments: [
        {A:true, recievePropsError: true},
        {}
      ],
      error: new Error('recievePropsError')
    });
  });

  it('should catch errors in componentDidMount', function () {
    errorHandler.mockClear();

    var stub = TestUtils.renderIntoDocument(<ExampleComponent didMountError/>);

    expect(errorHandler).lastCalledWith({
      displayName: 'ExampleComponent',
      method: 'componentDidMount',
      props: {
        didMountError: true
      },
      state: stub.getInitialState(),
      error: new Error('didMountError')
    });
  });

  it('should catch errors in getInitialState', function () {
    errorHandler.mockClear();

    TestUtils.renderIntoDocument(<ExampleComponent stateError/>);

    expect(errorHandler).lastCalledWith({
      displayName: 'ExampleComponent',
      method: 'getInitialState',
      props: {
        stateError: true
      },
      state: null,
      error: new Error('stateError')
    });
  });

  it('should catch errors in shouldComponentUpdate', function () {
    errorHandler.mockClear();

    var stub = TestUtils.renderIntoDocument(<ExampleComponent shouldUpdateError/>);

    stub.setState({specialFlag: true});

    stub.setProps({A: true});

    expect(errorHandler).lastCalledWith({
      displayName: 'ExampleComponent',
      method: 'shouldComponentUpdate',
      props: {
        shouldUpdateError: true
      },
      state: {
        specialFlag: true
      },
      arguments: [
        {A: true, shouldUpdateError: true},
        {specialFlag: true},
        {}
      ],
      error: new Error('shouldUpdateError')
    });
  });

  it('should catch errors in componentWillUpdate', function () {
    errorHandler.mockClear();

    var stub = TestUtils.renderIntoDocument(<ExampleComponent willUpdateError/>);

    stub.setState({specialFlag: true});

    stub.setProps({A: true});

    expect(errorHandler).lastCalledWith({
      displayName: 'ExampleComponent',
      method: 'componentWillUpdate',
      props: {
        willUpdateError: true
      },
      state: {
        specialFlag: true
      },
      arguments: [
        {A: true, willUpdateError: true},
        {specialFlag: true},
        {}
      ],
      error: new Error('willUpdateError')
    });
  });

  it('should catch errors in componentDidUpdate', function () {
    errorHandler.mockClear();

    var stub = TestUtils.renderIntoDocument(<ExampleComponent didUpdateError/>);

    stub.setState({specialFlag: true});

    stub.setProps({A: true});

    expect(errorHandler).lastCalledWith({
      displayName: 'ExampleComponent',
      method: 'componentDidUpdate',
      props: {
        didUpdateError: true,
        A: true
      },
      state: {
        specialFlag: true
      },
      arguments: [
        {didUpdateError: true},
        {specialFlag: true},
        {}
      ],
      error: new Error('didUpdateError')
    });
  });

  it('should catch errors in componentWillUnmount', function () {
    errorHandler.mockClear();

    var node = global.document.createElement('DIV');
    var exampleComponent = React.render(<ExampleComponent unmountError/>, node);
    exampleComponent.setState({specialFlag: true});
    React.unmountComponentAtNode(node);

    expect(errorHandler).lastCalledWith({
      displayName: 'ExampleComponent',
      method: 'componentWillUnmount',
      props: {
        unmountError: true
      },
      state: {
        specialFlag: true
      },
      error: new Error('unmountError')
    });
  });

  it('should allow component to cancel error handling', function () {
    errorHandler.mockClear();

    var NoHandle = React.createClass({
      statics: {
        bubbleErrors: true
      },

      render: function () {
        throw new Error('fail');
        return <div/>;
      }
    });

    expect(function () {
      var node = global.document.createElement('DIV');
      React.render(<NoHandle/>, node);
      React.unmountComponentAtNode(node);
    }).toThrow();
  });
});
