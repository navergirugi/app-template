import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';

const { width } = Dimensions.get('window');

interface Props {
    visible: boolean;
    title: string;
    message: string;
    onPress: () => void;
    onClose: () => void;
}

export const InAppNotification: React.FC<Props> = ({ visible, title, message, onPress, onClose }) => {
    const translateY = useRef(new Animated.Value(-150)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                speed: 12,
                bounciness: 5,
            }).start();

            // 3초 후 자동 닫힘
            const timer = setTimeout(() => {
                handleClose();
            }, 4000);

            return () => clearTimeout(timer);
        } else {
            handleClose();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(translateY, {
            toValue: -150,
            duration: 300,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
            {/* SafeAreaView를 사용하여 노치 영역 고려 */}
            <SafeAreaView>
                <TouchableOpacity style={styles.content} onPress={onPress}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message} numberOfLines={2}>{message}</Text>
                    </View>
                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </SafeAreaView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999, // 최상단
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        padding: 15,
        paddingTop: 10, // status bar space (approx)
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    message: {
        fontSize: 13,
        color: '#666',
    },
    closeBtn: {
        padding: 5,
    },
    closeText: {
        color: '#999',
        fontSize: 16,
    },
});
