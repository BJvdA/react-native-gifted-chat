import PropTypes from 'prop-types';
import React from 'react';

import {
  FlatList,
  View,
} from 'react-native';

import shallowequal from 'shallowequal';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import md5 from 'md5';
import LoadEarlier from './LoadEarlier';
import Message from './Message';

export default class MessageContainer extends React.Component {
  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderLoadEarlier = this.renderLoadEarlier.bind(this);
    this.renderScrollComponent = this.renderScrollComponent.bind(this);

    /*const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        return r1.hash !== r2.hash;
      }
    });*/

    const messagesData = this.prepareMessages(props.chat);
    /*this.state = {
      dataSource: dataSource.cloneWithRows(messagesData.blob, messagesData.keys)
    };*/

    this.state = {
      messagesData: messagesData
    }
  }

  prepareMessages(chat) {
    return chat.messages.map((m, i) => {
        const previousMessage = chat.messages[i + 1] || {};
        const nextMessage = chat.messages[i - 1] || {};
        // add next and previous messages to hash to ensure updates
        const toHash = JSON.stringify(m) + previousMessage._id + nextMessage._id;

        return {
          ...m,
          previousMessage,
          nextMessage,
          hash: md5(toHash)
        };
      })
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (!shallowequal(this.props, nextProps) || (this.props.chat && this.props.chat.messages && this.props.chat.messages.length !==  nextProps.chat.messages.length)) {
      return true;
    }
    if (!shallowequal(this.state, nextState)) {
      return true;
    }
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.chat === nextProps.chat && (!nextProps.chat.messages || nextProps.chat.messages.length === this.state.messagesData.length)) {
      return;
    }

    const messagesData = this.prepareMessages(nextProps.chat);
    /*this.setState({
      dataSource: this.state.dataSource.cloneWithRows(messagesData.blob, messagesData.keys)
    });*/
    this.setState({
      messagesData: messagesData
    })
  }

  renderFooter() {
    if (this.props.renderFooter) {
      const footerProps = {
        ...this.props,
      };
      return this.props.renderFooter(footerProps);
    }
    return null;
  }

  renderLoadEarlier() {
    if (this.props.loadEarlier === true) {
      const loadEarlierProps = {
        ...this.props,
      };
      if (this.props.renderLoadEarlier) {
        return this.props.renderLoadEarlier(loadEarlierProps);
      }
      return (
        <LoadEarlier {...loadEarlierProps}/>
      );
    }
    return null;
  }

  scrollTo(options) {
    //this._invertibleScrollViewRef.scrollTo(options);
  }

  renderRow({item}) {
    var message = item;

    if (!message._id && message._id !== 0) {
      console.warn('GiftedChat: `_id` is missing for message', JSON.stringify(message));
    }

    const messageProps = {
      ...this.props,
      key: message._id,
      currentMessage: message,
      previousMessage: message.previousMessage,
      nextMessage: message.nextMessage,
      position: message.senderId === this.props.user._id ? 'right' : 'left',
    };

    if (this.props.renderMessage) {
      return this.props.renderMessage(messageProps);
    }
    return <Message {...messageProps}/>;
  }

  renderScrollComponent(props) {
    const invertibleScrollViewProps = this.props.invertibleScrollViewProps;
    return (
      <InvertibleScrollView
        {...props}
        {...invertibleScrollViewProps}
        ref={component => this._invertibleScrollViewRef = component}
      />
    );
  }

  render() {
    /*
    <ListView
      enableEmptySections={true}
      automaticallyAdjustContentInsets={false}
      initialListSize={20}
      pageSize={20}

      {...this.props.listViewProps}

      dataSource={this.state.dataSource}

      renderRow={this.renderRow}
      renderHeader={this.renderFooter}
      renderFooter={this.renderLoadEarlier}
      renderScrollComponent={this.renderScrollComponent}
    />
    */
    return (
      <View ref='container' style={{flex:1}}>
        <FlatList
          inverted={true}

          automaticallyAdjustContentInsets={false}
          windowSize={20}

          {...this.props.listViewProps}


          {...this.props.invertibleScrollViewProps}

          data={this.state.messagesData}

          keyExtractor={(m) => m._id}

          renderItem={this.renderRow}
          ListHeaderComponent={this.renderFooter}
          ListFooterComponent={this.renderLoadEarlier}
        />
      </View>
    );
  }
}

MessageContainer.defaultProps = {
  chat: null,
  senderId: null,
  renderFooter: null,
  renderMessage: null,
  onLoadEarlier: () => {
  },
};

MessageContainer.propTypes = {
  chat: PropTypes.object,
  senderId: PropTypes.string,
  renderFooter: PropTypes.func,
  renderMessage: PropTypes.func,
  onLoadEarlier: PropTypes.func,
  listViewProps: PropTypes.object,
};
