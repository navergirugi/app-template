import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Config } from '../constants/Config';

const { width, height } = Dimensions.get('window');

interface Props {
    onFinish: () => void;
    data?: any[];
}

export const OnboardingScreen: React.FC<Props> = ({ onFinish, data }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const onboardingData = data && data.length > 0 ? data : Config.DEFAULT_ONBOARDING_DATA;

    const handleNext = () => {
        if (currentPage < onboardingData.length - 1) {
            setCurrentPage(currentPage + 1);
        } else {
            onFinish();
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                pagingEnabled
                scrollEnabled={false} // 버튼으로만 이동
                showsHorizontalScrollIndicator={false}
                contentOffset={{ x: width * currentPage, y: 0 }}
                style={styles.scrollView}
            >
                {onboardingData.map((item, index) => (
                    <View key={item.id} style={styles.slide}>
                        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {onboardingData.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentPage ? styles.activeDot : null,
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {currentPage === onboardingData.length - 1 ? '시작하기' : '다음'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: width,
        height: height,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: 20,
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ddd',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#007AFF',
        width: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
