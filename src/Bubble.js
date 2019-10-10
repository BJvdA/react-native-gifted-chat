import PropTypes from 'prop-types';
import React from 'react';
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewPropTypes,
} from 'react-native';

import MessageText from './MessageText';
import MessageImage from './MessageImage';
import Time from './Time';

import { isSameUser, isSameDay, warnDeprecated } from './utils';

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);
    this.onLongPress = this.onLongPress.bind(this);
  }

  handleBubbleToNext() {
    if (isSameUser(this.props.currentMessage, this.props.nextMessage) && isSameDay(this.props.currentMessage, this.props.nextMessage)) {
      return StyleSheet.flatten([styles[this.props.position].containerToNext, this.props.containerToNextStyle[this.props.position]]);
    }
    return null;
  }

  handleBubbleToPrevious() {
    if (isSameUser(this.props.currentMessage, this.props.previousMessage) && isSameDay(this.props.currentMessage, this.props.previousMessage)) {
      return StyleSheet.flatten([styles[this.props.position].containerToPrevious, this.props.containerToPreviousStyle[this.props.position]]);
    }
    return null;
  }

  renderMessageReply() {
    let content = null;
    const replyTo = this.props.currentMessage;

    if (replyTo) {
      if (replyTo.replyMessage) {
        const {containerStyle, wrapperStyle, ...messageTextProps} = this.props;

        content = (
          <MessageText {...{
            ...messageTextProps,
            currentMessage: {
              ...messageTextProps.currentMessage,
              message: replyTo.replyMessage
            }
           }}/>
         );
      } else if (replyTo.replyImage) {
        const {containerStyle, wrapperStyle, ...messageImageProps} = this.props;

        content = this.props.renderMessageImage({
          ...messageImageProps,
          currentMessage: {
            ...messageImageProps.currentMessage,
            image: replyTo.replyImage
          },
          context: this.context
        });
      } else if (replyTo.replyVideo) {
        const {containerStyle, wrapperStyle, ...messageVideoProps} = this.props;

        content = this.props.renderMessageVideo({
          ...messageVideoProps,
          currentMessage: {
            ...messageVideoProps.currentMessage,
            video: replyTo.replyVideo,
            videoThumbnail: replyTo.replyVideoThumbnail
          },
          context: this.context
        });
      }

      if (content) {
        const position = this.props.position === 'left' ? 'right' : 'left';

        return (
          <View style={styles.replyWrapper}>
            <View style={[styles[position].wrapper, styles[position].replyFix, this.props.wrapperStyle[position], styles.replyInner]}>
              {this.renderTopNameInner(replyTo.replyName)}
              {content}
            </View>
          </View>
        );
      }
    }

    return null;
  }

  renderMessageText() {
    if (this.props.currentMessage.message) {
      const {containerStyle, wrapperStyle, ...messageTextProps} = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps}/>;
    }
    return null;
  }

  renderMessageImage() {
    if (this.props.currentMessage.image) {
      const {containerStyle, wrapperStyle, ...messageImageProps} = this.props;
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage({...messageImageProps, context: this.context});
      }
      return <MessageImage {...messageImageProps}/>;
    }
    return null;
  }

  renderMessageVideo() {
    if (this.props.currentMessage.video) {
      const {containerStyle, wrapperStyle, ...messageVideoProps} = this.props;
      if (this.props.renderMessageVideo) {
        return this.props.renderMessageVideo({...messageVideoProps, context: this.context});
      }
      return null;
    }
    return null;
  }

  renderMessageDocument() {
    if (this.props.currentMessage.document) {
      const {containerStyle, wrapperStyle, ...messageDocumentProps} = this.props;
      if (this.props.renderMessageDocument) {
        return this.props.renderMessageDocument({...messageDocumentProps, context: this.context});
      }
      return null;
    }
    return null;
  }

  renderTicks() {
    const {currentMessage} = this.props;
    if (this.props.renderTicks) {
        return this.props.renderTicks(currentMessage);
    }
    if (currentMessage.senderId !== this.props.senderId) {
        return;
    }
    if (currentMessage.sent || currentMessage.received) {
      return (
        <View style={styles.tickView}>
          {currentMessage.sent && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
          {currentMessage.received && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
        </View>
      )
    }
  }

  renderTime() {
    if (this.props.currentMessage.createdAt) {
      const {containerStyle, wrapperStyle, ...timeProps} = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <Time {...timeProps}/>;
    }
    return null;
  }

  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props);
    }
    return null;
  }

  renderTopNameInner(userName) {
    const name = userName.toUpperCase().split(' ');
    if (name.length === 1) {
      this.avatarName = `${name[0].charAt(0)}`;
    } else if (name.length > 1) {
      this.avatarName = `${name[0].charAt(0)}${name[1].charAt(0)}`;
    } else {
      this.avatarName = '';
    }

    let sumChars = 0;
    for(let i = 0; i < userName.length; i++) {
      sumChars += userName.charCodeAt(i);
    }

    // inspired by https://github.com/wbinnssmith/react-user-avatar
    // colors from https://flatuicolors.com/
    const colors = [
      '#e67e22', // carrot
      '#2ecc71', // emerald
      '#3498db', // peter river
      '#8e44ad', // wisteria
      '#e74c3c', // alizarin
      '#1abc9c', // turquoise
      '#2c3e50', // midnight blue
    ];

    return (
      <Text style={[styles.topName, {color: colors[sumChars % colors.length]}]} numberOfLines={1}>{userName}</Text>
    )
  }

  renderTopName() {
    if(this.props.position === 'left' && (this.props.chat && (this.props.chat.group || this.props.chat.general))) {
      if(!isSameUser(this.props.currentMessage, this.props.previousMessage) && this.props.currentMessage.sender) {
        return this.renderTopNameInner(this.props.currentMessage.sender.firstName + ' ' + this.props.currentMessage.sender.lastName || '');
      }
    }

    return null;
  }

  onLongPress() {
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage);
    } else {
      if (this.props.currentMessage.message) {
        const options = [
          'Copy Text',
          'Cancel',
        ];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions({
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(this.props.currentMessage.message);
              break;
          }
        });
      }
    }
  }

  render() {
    return (
      <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
        <View style={[styles[this.props.position].wrapper, this.props.wrapperStyle[this.props.position], this.handleBubbleToNext(), this.handleBubbleToPrevious()]}>
          <TouchableWithoutFeedback
            onLongPress={this.onLongPress}
            accessibilityTraits="text"
            {...this.props.touchableProps}
          >
            <View>
              {this.renderTopName()}
              {this.renderCustomView()}
              {this.renderMessageReply()}
              {this.renderMessageImage()}
              {this.renderMessageVideo()}
              {this.renderMessageDocument()}
              {this.renderMessageText()}
              <View style={[styles.bottom, this.props.bottomContainerStyle[this.props.position]]}>
                {this.renderTime()}
                {this.renderTicks()}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

const styles = {
  topName: {
    paddingHorizontal: 10,
    paddingTop: 5,
    fontSize: 11,
    backgroundColor: 'transparent'
  },
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#E6E9ED',
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
    replyFix: {
      marginRight: 0
    }
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#ffffff',
      borderWidth: 0.5,
      borderColor: 'rgba(202,202,202,0.92)',
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
    replyFix: {
      marginLeft: 0
    }
  }),
  bottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tick: {
    fontSize: 10,
    backgroundColor: 'transparent',
    color: 'white',
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10,
  },
  replyWrapper: {
    padding: 3,
    width: '100%'
  },
  replyInner: {
    width: '100%'
  }
};

Bubble.contextTypes = {
  actionSheet: PropTypes.func,
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTime: null,
  position: 'left',
  currentMessage: {
    message: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
  //TODO: remove in next major release
  isSameDay: warnDeprecated(isSameDay),
  isSameUser: warnDeprecated(isSameUser),
};

Bubble.propTypes = {
  touchableProps: PropTypes.object,
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderTime: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  wrapperStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  bottomContainerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  tickStyle: Text.propTypes.style,
  containerToNextStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  //TODO: remove in next major release
  isSameDay: PropTypes.func,
  isSameUser: PropTypes.func,
};
