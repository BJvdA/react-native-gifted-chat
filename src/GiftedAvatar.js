/*
**  This component will be published in a separate package
*/
import PropTypes from 'prop-types';
import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// TODO
// 3 words name initials
// handle only alpha numeric chars

export default class GiftedAvatar extends React.Component {
  setAvatarColor() {
    const userName = this.props.sender.firstName + ' ' + this.props.sender.lastName || '';
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

    this.avatarColor = colors[sumChars % colors.length];
  }

  renderAvatar() {
    /*if (typeof this.props.sender.profileImage === 'function') {
      return this.props.avatar();
    } else */if (typeof this.props.sender.profileImage === 'string') {
      return (
        <Image
          source={{uri: this.props.sender.profileImage}}
          style={[defaultStyles.avatarStyle, this.props.avatarStyle]}
        />
      );
    }/* else if (typeof this.props.avatar === 'number') {
      return (
        <Image
          source={this.props.avatar}
          style={[defaultStyles.avatarStyle, this.props.avatarStyle]}
        />
      );
    }*/
    return null;
  }

  renderInitials() {
    return (
      <Text style={[defaultStyles.textStyle, this.props.textStyle]}>
        {this.avatarName}
      </Text>
    );
  }

  render() {
    if (!this.props.sender || (!this.props.sender.firstName && !this.props.sender.lastName && !this.props.sender.profileImage)) {
      // render placeholder
      return (
        <View
          style={[
            defaultStyles.avatarStyle,
            {backgroundColor: 'transparent'},
            this.props.avatarStyle,
          ]}
          accessibilityTraits="image"
        />
      )
    }
    if (this.props.sender.profileImage) {
      return (
        <TouchableOpacity
          disabled={this.props.onPress ? false : true}
          onPress={() => {
            const {onPress, ...other} = this.props;
            this.props.onPress && this.props.onPress(other);
          }}
          accessibilityTraits="image"
        >
          {this.renderAvatar()}
        </TouchableOpacity>
      );
    }

    if (!this.avatarColor) {
      this.setAvatarColor();
    }

    return (
      <TouchableOpacity
        disabled={this.props.onPress ? false : true}
        onPress={() => {
          const {onPress, ...other} = this.props;
          this.props.onPress && this.props.onPress(other);
        }}
        style={[
          defaultStyles.avatarStyle,
          {backgroundColor: this.avatarColor},
          this.props.avatarStyle,
        ]}
        accessibilityTraits="image"
      >
        {this.renderInitials()}
      </TouchableOpacity>
    );
  }
}

const defaultStyles = {
  avatarStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textStyle: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'transparent',
    fontWeight: '100',
  },
};

GiftedAvatar.defaultProps = {
  avatar: null,
  senderId: null,
  sender: null,
  onPress: null,
  avatarStyle: {},
  textStyle: {},
};

GiftedAvatar.propTypes = {
  senderId: PropTypes.string,
  sender: PropTypes.object,
  onPress: PropTypes.func,
  avatarStyle: Image.propTypes.style,
  textStyle: Text.propTypes.style,
};
