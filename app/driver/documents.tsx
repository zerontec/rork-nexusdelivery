import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { Camera, Upload, CheckCircle, XCircle, AlertCircle, ChevronLeft, Clock } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';

const REQUIRED_DOCUMENTS = [
    { id: 'license_front', title: 'Licencia (Frente)', description: 'Foto clara del frente de tu licencia' },
    { id: 'license_back', title: 'Licencia (Dorso)', description: 'Foto clara del dorso de tu licencia' },
    { id: 'id_card', title: 'Cédula de Identidad', description: 'Foto de tu documento de identidad' },
    { id: 'vehicle_papers', title: 'Documentos del Vehículo', description: 'Carnet de circulación o título' },
];

export default function DriverDocumentsScreen() {
    const router = useRouter();
    const { user } = useApp();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, [user]);

    const fetchDocuments = async () => {
        if (!user) return;
        try {
            // Get driver ID first
            const { data: driver } = await supabase.from('drivers').select('id').eq('id', user.id).single();
            if (!driver) return;

            const { data, error } = await supabase
                .from('driver_documents')
                .select('*')
                .eq('driver_id', driver.id);

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async (documentType: string) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                uploadImage(documentType, result.assets[0].base64);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const uploadImage = async (documentType: string, base64: string) => {
        if (!user) return;
        setUploading(documentType);

        try {
            // Get driver ID
            const { data: driver } = await supabase.from('drivers').select('id').eq('id', user.id).single();
            if (!driver) throw new Error('Driver not found');

            const fileName = `${driver.id}/${documentType}_${Date.now()}.jpg`;

            // Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('driver-documents')
                .upload(fileName, decode(base64), {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('driver-documents')
                .getPublicUrl(fileName);

            // Save/Update record in DB
            const existingDoc = documents.find(d => d.document_type === documentType);

            if (existingDoc) {
                await supabase
                    .from('driver_documents')
                    .update({
                        file_url: publicUrl,
                        status: 'pending',
                        rejection_reason: null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingDoc.id);
            } else {
                await supabase
                    .from('driver_documents')
                    .insert({
                        driver_id: driver.id,
                        document_type: documentType,
                        file_url: publicUrl,
                        status: 'pending'
                    });
            }

            await fetchDocuments();
            Alert.alert('Éxito', 'Documento subido correctamente para revisión');

        } catch (error: any) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Falló la subida del documento: ' + error.message);
        } finally {
            setUploading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return COLORS.success;
            case 'rejected': return COLORS.error;
            case 'pending': return COLORS.warning;
            default: return COLORS.gray[400];
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle size={20} color={COLORS.success} />;
            case 'rejected': return <XCircle size={20} color={COLORS.error} />;
            case 'pending': return <Clock size={20} color={COLORS.warning} />; // Using Clock icon if imported, else AlertCircle
            default: return <AlertCircle size={20} color={COLORS.gray[400]} />;
        }
    };

    // Need to import Clock if used above, otherwise use AlertCircle for pending
    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'approved': return <CheckCircle size={24} color={COLORS.success} />;
            case 'rejected': return <XCircle size={24} color={COLORS.error} />;
            case 'pending': return <AlertCircle size={24} color={COLORS.warning} />;
            default: return <Upload size={24} color={COLORS.primary} />;
        }
    };

    const renderDocumentItem = (docType: { id: string, title: string, description: string }) => {
        const uploadedDoc = documents.find(d => d.document_type === docType.id);
        const status = uploadedDoc?.status || 'missing';
        const isUploading = uploading === docType.id;

        return (
            <Card key={docType.id} style={styles.docCard}>
                <View style={styles.docHeader}>
                    <View style={styles.docInfo}>
                        <Text style={styles.docTitle}>{docType.title}</Text>
                        <Text style={styles.docDesc}>{docType.description}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        {isUploading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <StatusIcon status={status} />
                        )}
                    </View>
                </View>

                {uploadedDoc?.rejection_reason && (
                    <View style={styles.rejectionBox}>
                        <Text style={styles.rejectionTitle}>Motivo de rechazo:</Text>
                        <Text style={styles.rejectionText}>{uploadedDoc.rejection_reason}</Text>
                    </View>
                )}

                {status !== 'approved' && (
                    <Button
                        onPress={() => pickImage(docType.id)}
                        variant="outline"
                        style={styles.uploadButton}
                        disabled={isUploading || status === 'pending'}
                    >
                        {status === 'missing' ? 'Subir Foto' : status === 'pending' ? 'En Revisión' : 'Subir Nuevamente'}
                    </Button>
                )}

                {status === 'approved' && (
                    <View style={styles.approvedBadge}>
                        <Text style={styles.approvedText}>Verificado</Text>
                    </View>
                )}
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Documentación</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Para activar tu cuenta, necesitamos verificar tu identidad y los documentos de tu vehículo.
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : (
                    REQUIRED_DOCUMENTS.map(renderDocumentItem)
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
        paddingTop: 60, // Safe area
    },
    backButton: {
        padding: SPACING.xs,
        marginRight: SPACING.sm,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSize.xl,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.gray[900],
    },
    content: {
        padding: SPACING.md,
    },
    infoBox: {
        backgroundColor: COLORS.primary + '10',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
    },
    infoText: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSize.sm,
        textAlign: 'center',
    },
    docCard: {
        marginBottom: SPACING.md,
        padding: SPACING.md,
    },
    docHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    docInfo: {
        flex: 1,
        marginRight: SPACING.md,
    },
    docTitle: {
        fontSize: TYPOGRAPHY.fontSize.md,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.gray[900],
        marginBottom: 4,
    },
    docDesc: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.gray[500],
    },
    statusContainer: {
        width: 32,
        alignItems: 'center',
    },
    uploadButton: {
        marginTop: SPACING.sm,
    },
    rejectionBox: {
        backgroundColor: COLORS.error + '10',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.sm,
    },
    rejectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.error,
    },
    rejectionText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.error,
    },
    approvedBadge: {
        backgroundColor: COLORS.success + '20',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: BORDER_RADIUS.full,
        alignSelf: 'flex-start',
        marginTop: SPACING.xs,
    },
    approvedText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.success,
    },
});
