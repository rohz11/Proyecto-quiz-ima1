import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Usuario } from '@/types/user';
import { TipoPregunta, Pregunta, PreguntaData } from '@/types/quiz';
import { pickImage } from '@/utils';
import { guardarQuiz } from '@/utils/api';

const TIPOS_PREGUNTA = [
  { id: 'quiz' as TipoPregunta, nombre: 'Quiz', icono: 'help-circle' },
  { id: 'verdadero_falso' as TipoPregunta, nombre: 'Verdadero o falso', icono: 'checkbox' },
  { id: 'seleccion_multiple' as TipoPregunta, nombre: 'Selección múltiple', icono: 'list' },
  { id: 'completacion' as TipoPregunta, nombre: 'Completación', icono: 'create' },
];

// Colores exactos de Kahoot
const COLORES_RESPUESTA = ['#E21F3D', '#1368CE', '#D89E00', '#26890C']; // Rojo, Azul, Amarillo, Verde
const COLOR_FONDO = '#f5f5f5';
const COLOR_TIEMPO = '#8648CE'; // Púrpura Kahoot

export default function CrearScreen() {
  const [preguntas, setPreguntas] = useState<PreguntaData[]>([
    {
      id: 1,
      tipo: 'quiz',
      pregunta: '',
      respuestas: ['', '', '', ''],
      respuestaCorrecta: 0,
      respuestasCorrectas: [0],
      tiempo: 20,
      imagen: null,
    }
  ]);
  const [preguntaActual, setPreguntaActual] = useState(1);
  const [tipoPregunta, setTipoPregunta] = useState<TipoPregunta>('quiz');
  const [mostrarSelectorTipo, setMostrarSelectorTipo] = useState(false);
  const [mostrarModalGuardado, setMostrarModalGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [textoPregunta, setTextoPregunta] = useState('');
  const [respuestas, setRespuestas] = useState(['', '', '', '']);
  const [tiempo, setTiempo] = useState(20);
  const [imagenPregunta, setImagenPregunta] = useState<string | null>(null);
  const [mostrarSelectorTiempo, setMostrarSelectorTiempo] = useState(false);
  const [mostrarMenuOpciones, setMostrarMenuOpciones] = useState(false);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(0);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState<number[]>([0]); // Para selección múltiple
  const [mostrarModalRespuesta, setMostrarModalRespuesta] = useState(false);
  const [respuestaEditando, setRespuestaEditando] = useState<{ index: number; texto: string } | null>(null);
  
  // Estados para configuración final del quiz
  const [mostrarModalConfiguracion, setMostrarModalConfiguracion] = useState(false);
  const [tituloQuiz, setTituloQuiz] = useState('');
  const [materiaQuiz, setMateriaQuiz] = useState('');
  const [portadaQuiz, setPortadaQuiz] = useState<string | null>(null);
  const [mostrarSelectorMateria, setMostrarSelectorMateria] = useState(false);
  
  const MATERIAS = [
    'Matemáticas',
    'Ciencias',
    'Lenguaje',
    'Historia',
    'Geografía',
    'Biología',
    'Física',
    'Química',
    'Inglés',
    'Arte',
    'Música',
    'Educación Física',
    'Otra'
  ];

  const OPCIONES_TIEMPO = [5, 10, 20, 30, 60, 90, 120, 180, 240];

  const handleGuardar = () => {
    // Primero mostrar modal de configuración
    setMostrarModalConfiguracion(true);
  };
  
  const handleFinalizarGuardado = async () => {
    try {
      setGuardando(true);
      setErrorGuardado(null);
      
      // Busco el usuario que está logueado para ponerlo como autor del quiz
      const userData = await SecureStore.getItemAsync('user');
      const usuario = userData ? JSON.parse(userData) : null;
      const autorId = usuario?.usu_id || 1; // Si no hay usuario, pongo 1 por defecto
      
      // Preparar las preguntas en formato del backend
      const preguntasFormateadas = preguntas.map((p, index) => ({
        nro_orden: index + 1,
        tipo: p.tipo,
        enunciado: p.pregunta,
        tiempo_limite_segundos: p.tiempo,
        opciones: p.respuestas.map((respuesta, idx) => ({
          texto: respuesta,
          es_correcta: p.tipo === 'seleccion_multiple' 
            ? (p.respuestasCorrectas || []).includes(idx)
            : idx === p.respuestaCorrecta
        })),
        multimedia: p.imagen ? { tipo: 'imagen', url: p.imagen } : null,
        categoria: materiaQuiz,
        puntos_si_es_dificultad: 10
      }));
      
      // Armo el objeto con toda la info del quiz
      const quizData = {
        metadatos: {
          titulo: tituloQuiz,
          tema: materiaQuiz,
          autor_id: autorId,
          imagen_portada: portadaQuiz,
          recompensa_puntos_app: 100
        },
        preguntas: preguntasFormateadas
      };
      
      // Lo mando al backend para que lo guarde en MongoDB
      const resultado = await guardarQuiz(quizData);
      console.log('Quiz guardado:', resultado);
      
      // Cierro el modal de configuración
      setMostrarModalConfiguracion(false);
      
      // Muestro el "Guardado correctamente"
      setMostrarModalGuardado(true);
      setTimeout(() => {
        setMostrarModalGuardado(false);
        router.push('/profesor/biblioteca' as any);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error guardando quiz:', error);
      setErrorGuardado(error.message || 'Error al guardar el quiz');
      alert('Error al guardar: ' + (error.message || 'Error desconocido'));
    } finally {
      setGuardando(false);
    }
  };
  
  const seleccionarPortada = async () => {
    const result = await pickImage();
    if (result) {
      setPortadaQuiz(result);
    }
  };

  const totalPreguntas = preguntas.length;

  // Guardar pregunta actual en el array
  const guardarPreguntaActual = () => {
    setPreguntas(prevPreguntas => {
      const nuevasPreguntas = [...prevPreguntas];
      nuevasPreguntas[preguntaActual - 1] = {
        id: preguntaActual,
        tipo: tipoPregunta,
        pregunta: textoPregunta,
        respuestas: [...respuestas],
        respuestaCorrecta,
        respuestasCorrectas: tipoPregunta === 'seleccion_multiple' ? respuestasCorrectas : undefined,
        tiempo,
        imagen: imagenPregunta,
      };
      return nuevasPreguntas;
    });
  };

  // Cargar una pregunta del array
  const cargarPregunta = (index: number) => {
    const pregunta = preguntas[index];
    if (pregunta) {
      setTipoPregunta(pregunta.tipo);
      setTextoPregunta(pregunta.pregunta);
      setRespuestas(pregunta.respuestas);
      setRespuestaCorrecta(pregunta.respuestaCorrecta);
      setRespuestasCorrectas(pregunta.respuestasCorrectas || [pregunta.respuestaCorrecta]);
      setTiempo(pregunta.tiempo);
      setImagenPregunta(pregunta.imagen);
    }
  };

  // Crear nueva pregunta vacía
  const crearNuevaPregunta = () => {
    // Guardar pregunta actual primero usando función de actualización
    const preguntaActualGuardada: PreguntaData = {
      id: preguntaActual,
      tipo: tipoPregunta,
      pregunta: textoPregunta,
      respuestas: [...respuestas],
      respuestaCorrecta,
      respuestasCorrectas: tipoPregunta === 'seleccion_multiple' ? respuestasCorrectas : undefined,
      tiempo,
      imagen: imagenPregunta,
    };
    
    setPreguntas(prevPreguntas => {
      const nuevasPreguntas = [...prevPreguntas];
      nuevasPreguntas[preguntaActual - 1] = preguntaActualGuardada;
      return nuevasPreguntas;
    });
    
    const nuevoId = totalPreguntas + 1;
    const nuevaPregunta: PreguntaData = {
      id: nuevoId,
      tipo: 'quiz',
      pregunta: '',
      respuestas: ['', '', '', ''],
      respuestaCorrecta: 0,
      respuestasCorrectas: [0],
      tiempo: 20,
      imagen: null,
    };
    
    setPreguntas(prevPreguntas => [...prevPreguntas, nuevaPregunta]);
    setPreguntaActual(nuevoId);
    // Limpiar estados
    setTipoPregunta('quiz');
    setTextoPregunta('');
    setRespuestas(['', '', '', '']);
    setRespuestaCorrecta(0);
    setRespuestasCorrectas([0]);
    setTiempo(20);
    setImagenPregunta(null);
  };

  const handleSiguiente = () => {
    if (preguntaActual < totalPreguntas) {
      guardarPreguntaActual();
      const siguienteIndex = preguntaActual; // Ya es 0-indexed para el siguiente
      setPreguntaActual(preguntaActual + 1);
      cargarPregunta(siguienteIndex);
    } else {
      crearNuevaPregunta();
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 1) {
      guardarPreguntaActual();
      cargarPregunta(preguntaActual - 2);
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const handleEliminarPregunta = () => {
    if (totalPreguntas > 1) {
      const nuevasPreguntas = preguntas.filter((_, i) => i !== preguntaActual - 1);
      // Reindexar IDs
      const preguntasReindexadas = nuevasPreguntas.map((p, i) => ({ ...p, id: i + 1 }));
      setPreguntas(preguntasReindexadas);
      
      if (preguntaActual > 1) {
        setPreguntaActual(preguntaActual - 1);
        cargarPregunta(preguntaActual - 2);
      } else {
        cargarPregunta(0);
      }
    }
    setMostrarMenuOpciones(false);
  };

  const seleccionarTipo = (tipo: TipoPregunta) => {
    setTipoPregunta(tipo);
    // Ajustar respuestas según el tipo
    let nuevasRespuestas: string[];
    switch (tipo) {
      case 'verdadero_falso':
        nuevasRespuestas = ['Verdadero', 'Falso'];
        setRespuestaCorrecta(0);
        setRespuestasCorrectas([0]);
        break;
      case 'completacion':
        nuevasRespuestas = [''];
        setRespuestaCorrecta(0);
        setRespuestasCorrectas([0]);
        break;
      case 'seleccion_multiple':
        // Selección múltiple: mantener o inicializar 4 respuestas
        nuevasRespuestas = respuestas.length >= 2 ? respuestas.slice(0, 4) : ['', '', '', ''];
        if (nuevasRespuestas.length < 4) {
          while (nuevasRespuestas.length < 4) nuevasRespuestas.push('');
        }
        setRespuestasCorrectas([0]); // Por defecto la primera es correcta
        setRespuestaCorrecta(0);
        break;
      default:
        // Quiz: mantener o inicializar 4 respuestas
        nuevasRespuestas = respuestas.length >= 2 ? respuestas.slice(0, 4) : ['', '', '', ''];
        if (nuevasRespuestas.length < 4) {
          while (nuevasRespuestas.length < 4) nuevasRespuestas.push('');
        }
        setRespuestaCorrecta(0);
        setRespuestasCorrectas([0]);
    }
    setRespuestas(nuevasRespuestas);
    setMostrarSelectorTipo(false);
  };

  const getCantidadRespuestas = () => {
    switch (tipoPregunta) {
      case 'verdadero_falso':
        return 2;
      case 'completacion':
        return 1;
      default:
        return respuestas.filter(r => r !== '' || respuestas.indexOf(r) < 2).length;
    }
  };

  const agregarRespuesta = () => {
    if (respuestas.length < 4 && tipoPregunta !== 'verdadero_falso' && tipoPregunta !== 'completacion') {
      setRespuestas([...respuestas, '']);
    }
  };

  const eliminarRespuesta = (index: number) => {
    if (tipoPregunta === 'verdadero_falso') return; // No eliminar en V/F
    if (respuestas.length > 2) {
      const nuevas = respuestas.filter((_, i) => i !== index);
      setRespuestas(nuevas);
    }
  };

  const updateRespuesta = (index: number, texto: string) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[index] = texto;
    setRespuestas(nuevasRespuestas);
  };

  const seleccionarRespuestaCorrecta = (index: number) => {
    if (tipoPregunta === 'seleccion_multiple') {
      // Toggle: agregar o quitar de la lista de correctas
      const nuevasCorrectas = respuestasCorrectas.includes(index)
        ? respuestasCorrectas.filter(i => i !== index)
        : [...respuestasCorrectas, index];
      setRespuestasCorrectas(nuevasCorrectas);
      // Guardar
      const nuevasPreguntas = [...preguntas];
      nuevasPreguntas[preguntaActual - 1] = {
        ...nuevasPreguntas[preguntaActual - 1],
        respuestasCorrectas: nuevasCorrectas,
      };
      setPreguntas(nuevasPreguntas);
    } else {
      // Quiz y V/F: solo una correcta
      setRespuestaCorrecta(index);
      const nuevasPreguntas = [...preguntas];
      nuevasPreguntas[preguntaActual - 1] = {
        id: preguntaActual,
        tipo: tipoPregunta,
        pregunta: textoPregunta,
        respuestas: [...respuestas],
        respuestaCorrecta: index,
        tiempo,
        imagen: imagenPregunta,
      };
      setPreguntas(nuevasPreguntas);
    }
  };

  const abrirModalRespuesta = (index: number) => {
    setRespuestaEditando({ index, texto: respuestas[index] || '' });
    setMostrarModalRespuesta(true);
  };

  const guardarRespuestaEditada = () => {
    if (respuestaEditando) {
      const nuevasRespuestas = [...respuestas];
      nuevasRespuestas[respuestaEditando.index] = respuestaEditando.texto;
      setRespuestas(nuevasRespuestas);
      
      // Guardar en el array de preguntas
      const nuevasPreguntas = [...preguntas];
      nuevasPreguntas[preguntaActual - 1] = {
        ...nuevasPreguntas[preguntaActual - 1],
        respuestas: nuevasRespuestas,
      };
      setPreguntas(nuevasPreguntas);
    }
    setMostrarModalRespuesta(false);
    setRespuestaEditando(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.headerKahoot}>
        <TouchableOpacity 
          style={styles.tipoSelector}
          onPress={() => setMostrarSelectorTipo(true)}
        >
          <Ionicons 
            name={TIPOS_PREGUNTA.find(t => t.id === tipoPregunta)?.icono as any || 'help-circle'} 
            size={20} 
            color="#333" 
          />
          <Text style={styles.tipoTexto}>
            {TIPOS_PREGUNTA.find(t => t.id === tipoPregunta)?.nombre || 'Quiz'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMostrarMenuOpciones(true)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.listoButton} onPress={handleGuardar}>
          <Text style={styles.listoTexto}>Listo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Área de multimedia tipo Kahoot con burbuja de tiempo */}
        <View style={styles.multimediaWrapper}>
          <TouchableOpacity 
            style={styles.multimediaArea}
            onPress={async () => {
              const imagen = await pickImage();
              if (imagen) {
                setImagenPregunta(imagen);
              }
            }}
          >
            {imagenPregunta ? (
              <View style={styles.imagenContainer}>
                <Image source={{ uri: imagenPregunta }} style={styles.imagenPreview} />
                <TouchableOpacity 
                  style={styles.botonEliminarImagen}
                  onPress={(e) => {
                    e.stopPropagation();
                    setImagenPregunta(null);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Ionicons name="image-outline" size={40} color="#666" />
                <Text style={styles.multimediaTexto}>Añadir imagen</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Burbuja de tiempo Kahoot - tocable, posicionada sobre el borde */}
          <TouchableOpacity 
            style={styles.tiempoBubble}
            onPress={() => setMostrarSelectorTiempo(true)}
          >
            <Ionicons name="time" size={14} color="#fff" />
            <Text style={styles.tiempoTexto}>{tiempo} s</Text>
          </TouchableOpacity>
        </View>

        {/* Campo de pregunta estilo Kahoot - límite 95 caracteres */}
        <View style={styles.preguntaContainer}>
          <TextInput
            style={styles.preguntaInput}
            value={textoPregunta}
            onChangeText={setTextoPregunta}
            placeholder="Pulsa para añadir una pregunta"
            placeholderTextColor="#888"
            multiline
            maxLength={95}
          />
          <Text style={styles.contadorCaracteres}>
            {textoPregunta.length}/95
          </Text>
        </View>

        {/* Grid de respuestas según tipo de pregunta */}
        <View style={[styles.respuestasGrid, tipoPregunta === 'verdadero_falso' && styles.respuestasGrid2Col]}>
          {tipoPregunta === 'completacion' ? (
            // Completación: Input simple
            <View style={styles.completacionContainer}>
              <Text style={styles.completacionLabel}>Respuesta correcta:</Text>
              <TextInput
                style={styles.completacionInput}
                value={respuestas[0] || ''}
                onChangeText={(texto) => updateRespuesta(0, texto)}
                placeholder="Escribe la respuesta correcta"
                placeholderTextColor="#888"
                maxLength={75}
              />
              <Text style={styles.respuestaContadorCompletacion}>
                {(respuestas[0] || '').length}/75
              </Text>
            </View>
          ) : (
            // Quiz, Selección múltiple, Verdadero/Falso
            respuestas.map((respuesta, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.respuestaCard, 
                  { backgroundColor: COLORES_RESPUESTA[index] },
                  tipoPregunta === 'verdadero_falso' && styles.respuestaCardVF,
                  (tipoPregunta === 'seleccion_multiple' 
                    ? respuestasCorrectas.includes(index)
                    : respuestaCorrecta === index
                  ) && styles.respuestaCardCorrecta
                ]}
                onPress={() => abrirModalRespuesta(index)}
              >
                {/* Figura geométrica de fondo translúcida */}
                {index === 0 && (
                  <View style={[styles.figuraFondo, { top: -10, right: -15, transform: [{ rotate: '15deg' }] }]}>
                    <Ionicons name="triangle" size={60} color="rgba(255,255,255,0.15)" />
                  </View>
                )}
                {index === 1 && (
                  <View style={[styles.figuraFondo, { bottom: -10, left: -10, transform: [{ rotate: '-10deg' }] }]}>
                    <Ionicons name="diamond" size={50} color="rgba(255,255,255,0.15)" />
                  </View>
                )}
                {index === 2 && (
                  <View style={[styles.figuraFondo, { top: -5, left: -15, transform: [{ rotate: '5deg' }] }]}>
                    <Ionicons name="square" size={50} color="rgba(255,255,255,0.15)" />
                  </View>
                )}
                {index === 3 && (
                  <View style={[styles.figuraFondo, { bottom: -15, right: -10, transform: [{ rotate: '-5deg' }] }]}>
                    <Ionicons name="ellipse" size={55} color="rgba(255,255,255,0.15)" />
                  </View>
                )}
                
                {/* Checkmark si es la respuesta correcta */}
                {(tipoPregunta === 'seleccion_multiple' 
                  ? respuestasCorrectas.includes(index)
                  : respuestaCorrecta === index
                ) && (
                  <View style={[
                    styles.checkCorrecta,
                    tipoPregunta === 'verdadero_falso' && styles.checkCorrectaVF
                  ]}>
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    {tipoPregunta === 'verdadero_falso' && (
                      <Text style={styles.textoCorrectaVF}>Correcta</Text>
                    )}
                  </View>
                )}
                
                {/* Texto de respuesta - no editable, abre modal al tocar */}
                <View style={styles.respuestaTextoContainer} pointerEvents="none">
                  {respuesta ? (
                    <Text style={styles.respuestaTexto} numberOfLines={2}>
                      {respuesta}
                    </Text>
                  ) : tipoPregunta !== 'verdadero_falso' ? (
                    <Text style={styles.respuestaPlaceholder}>
                      Agregar respuesta
                    </Text>
                  ) : null}
                </View>
                
                {tipoPregunta !== 'verdadero_falso' && respuesta.length > 0 && (
                  <Text style={styles.respuestaContador}>
                    {respuesta.length}/75
                  </Text>
                )}
                
                {/* Botón eliminar respuesta (solo si > 2 respuestas y no es V/F) */}
                {tipoPregunta !== 'verdadero_falso' && respuestas.length > 2 && (
                  <TouchableOpacity 
                    style={styles.botonEliminarRespuesta}
                    onPress={(e) => {
                      e.stopPropagation();
                      eliminarRespuesta(index);
                    }}
                  >
                    <Ionicons name="close" size={16} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Botón añadir más respuestas (solo para quiz/selección múltiple) */}
        {tipoPregunta !== 'verdadero_falso' && tipoPregunta !== 'completacion' && respuestas.length < 4 && (
          <TouchableOpacity style={styles.addPreguntaButton} onPress={agregarRespuesta}>
            <Ionicons name="add-circle" size={20} color={Colors.primary} />
            <Text style={styles.addPreguntaTexto}>Añadir respuesta</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Barra de navegación inferior con lista de preguntas */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={[styles.navButton, preguntaActual === 1 && styles.navButtonDisabled]}
          onPress={handleAnterior}
          disabled={preguntaActual === 1}
        >
          <Ionicons name="chevron-back" size={24} color={preguntaActual === 1 ? '#ccc' : '#333'} />
        </TouchableOpacity>

        {/* Lista horizontal de preguntas */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.preguntasList}
        >
          {preguntas.map((p, index) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.preguntaMiniatura,
                preguntaActual === index + 1 && styles.preguntaMiniaturaActiva,
                p.pregunta && styles.preguntaMiniaturaConContenido
              ]}
              onPress={() => {
                guardarPreguntaActual();
                cargarPregunta(index);
                setPreguntaActual(index + 1);
              }}
            >
              <Text style={[
                styles.preguntaMiniaturaNumero,
                preguntaActual === index + 1 && styles.preguntaMiniaturaNumeroActivo
              ]}>
                {index + 1}
              </Text>
              {p.imagen && (
                <View style={styles.miniaturaImagenIndicator}>
                  <Ionicons name="image" size={10} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.navButton} onPress={handleSiguiente}>
          <Ionicons name="add" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Modal selector de tipo */}
      <Modal
        visible={mostrarSelectorTipo}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarSelectorTipo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Cambiar modo</Text>
            {TIPOS_PREGUNTA.map((tipo) => (
              <TouchableOpacity
                key={tipo.id}
                style={[
                  styles.tipoOption,
                  tipoPregunta === tipo.id && styles.tipoOptionSelected
                ]}
                onPress={() => seleccionarTipo(tipo.id)}
              >
                <Ionicons name={tipo.icono as any} size={24} color={tipoPregunta === tipo.id ? Colors.primary : '#666'} />
                <Text style={[
                  styles.tipoOptionText,
                  tipoPregunta === tipo.id && styles.tipoOptionTextSelected
                ]}>
                  {tipo.nombre}
                </Text>
                {tipoPregunta === tipo.id && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setMostrarSelectorTipo(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal selector de tiempo */}
      <Modal
        visible={mostrarSelectorTiempo}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarSelectorTiempo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Tiempo límite</Text>
            <View style={styles.tiempoGrid}>
              {OPCIONES_TIEMPO.map((segundos) => (
                <TouchableOpacity
                  key={segundos}
                  style={[
                    styles.tiempoOption,
                    tiempo === segundos && styles.tiempoOptionSelected
                  ]}
                  onPress={() => {
                    setTiempo(segundos);
                    setMostrarSelectorTiempo(false);
                  }}
                >
                  <Text style={[
                    styles.tiempoOptionText,
                    tiempo === segundos && styles.tiempoOptionTextSelected
                  ]}>
                    {segundos}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setMostrarSelectorTiempo(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de configuración final del quiz */}
      <Modal
        visible={mostrarModalConfiguracion}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalConfiguracion(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalConfiguracionContent}>
            <Text style={styles.modalConfiguracionTitulo}>Configurar Quiz</Text>
            <Text style={styles.modalConfiguracionSubtitulo}>Personaliza tu quizzima antes de publicar</Text>
            
            {/* Portada */}
            <TouchableOpacity style={styles.portadaSelector} onPress={seleccionarPortada}>
              {portadaQuiz ? (
                <Image source={{ uri: portadaQuiz }} style={styles.portadaPreview} />
              ) : (
                <View style={styles.portadaPlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#999" />
                  <Text style={styles.portadaPlaceholderText}>Añadir portada</Text>
                </View>
              )}
              {portadaQuiz && (
                <View style={styles.portadaEditBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            
            {/* Título */}
            <View style={styles.configuracionField}>
              <Text style={styles.configuracionLabel}>Título del quiz</Text>
              <TextInput
                style={styles.configuracionInput}
                value={tituloQuiz}
                onChangeText={setTituloQuiz}
                placeholder="Ej: Quiz de Matemáticas - Álgebra"
                placeholderTextColor="#999"
                maxLength={50}
              />
              <Text style={styles.configuracionContador}>{tituloQuiz.length}/50</Text>
            </View>
            
            {/* Materia */}
            <View style={styles.configuracionField}>
              <Text style={styles.configuracionLabel}>Materia</Text>
              <TouchableOpacity 
                style={styles.materiaSelector}
                onPress={() => setMostrarSelectorMateria(true)}
              >
                <Text style={materiaQuiz ? styles.materiaTexto : styles.materiaPlaceholder}>
                  {materiaQuiz || 'Seleccionar materia'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Botones */}
            <View style={styles.modalConfiguracionBotones}>
              <TouchableOpacity 
                style={styles.modalConfigBotonCancelar}
                onPress={() => setMostrarModalConfiguracion(false)}
              >
                <Text style={styles.modalConfigBotonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalConfigBotonGuardar,
                  (!tituloQuiz.trim() || !materiaQuiz || guardando) && styles.modalConfigBotonGuardarDisabled
                ]}
                onPress={handleFinalizarGuardado}
                disabled={!tituloQuiz.trim() || !materiaQuiz || guardando}
              >
                <Text style={styles.modalConfigBotonGuardarTexto}>
                  {guardando ? 'Guardando...' : 'Publicar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal selector de materia */}
      <Modal
        visible={mostrarSelectorMateria}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarSelectorMateria(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorMateriaContent}>
            <Text style={styles.modalTitulo}>Seleccionar Materia</Text>
            
            <ScrollView style={styles.materiasLista}>
              {MATERIAS.map((materia) => (
                <TouchableOpacity 
                  key={materia}
                  style={[
                    styles.materiaOption,
                    materiaQuiz === materia && styles.materiaOptionSelected
                  ]}
                  onPress={() => {
                    setMateriaQuiz(materia);
                    setMostrarSelectorMateria(false);
                  }}
                >
                  <Text style={[
                    styles.materiaOptionText,
                    materiaQuiz === materia && styles.materiaOptionTextSelected
                  ]}>
                    {materia}
                  </Text>
                  {materiaQuiz === materia && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setMostrarSelectorMateria(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de guardado exitoso */}
      <Modal
        visible={mostrarModalGuardado}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalGuardadoContent}>
            <Ionicons name="checkmark-circle" size={60} color={Colors.success} />
            <Text style={styles.modalGuardadoTitulo}>¡Quizzima creado!</Text>
            <Text style={styles.modalGuardadoSubtitulo}>Guardado en biblioteca</Text>
          </View>
        </View>
      </Modal>

      {/* Modal menú de opciones */}
      <Modal
        visible={mostrarMenuOpciones}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarMenuOpciones(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitulo}>Opciones</Text>
            
            <TouchableOpacity 
              style={styles.menuOption}
              onPress={handleEliminarPregunta}
            >
              <Ionicons name="trash-outline" size={22} color={Colors.danger} />
              <Text style={[styles.menuOptionText, { color: Colors.danger }]}>
                Eliminar esta pregunta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuOption}
              onPress={() => {
                // Función duplicar pregunta (futura)
                setMostrarMenuOpciones(false);
              }}
            >
              <Ionicons name="copy-outline" size={22} color="#333" />
              <Text style={styles.menuOptionText}>Duplicar pregunta</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuCloseButton}
              onPress={() => setMostrarMenuOpciones(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de edición de respuesta */}
      <Modal
        visible={mostrarModalRespuesta}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalRespuesta(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalRespuestaContent}>
            <Text style={styles.modalTitulo}>
              Editar Respuesta {respuestaEditando ? String.fromCharCode(65 + respuestaEditando.index) : ''}
            </Text>
            
            {/* Input para editar texto (oculto en V/F) */}
            {tipoPregunta !== 'verdadero_falso' && (
              <>
                <TextInput
                  style={styles.modalRespuestaInput}
                  value={respuestaEditando?.texto || ''}
                  onChangeText={(texto) => setRespuestaEditando(prev => prev ? { ...prev, texto } : null)}
                  placeholder="Escribe la respuesta..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={75}
                  autoFocus
                />
                
                <Text style={styles.modalRespuestaContador}>
                  {(respuestaEditando?.texto || '').length}/75
                </Text>
              </>
            )}
            
            {/* En V/F mostrar solo el texto fijo */}
            {tipoPregunta === 'verdadero_falso' && respuestaEditando && (
              <View style={styles.modalRespuestaTextoFijo}>
                <Text style={styles.modalRespuestaTextoFijoLabel}>
                  {respuestaEditando.index === 0 ? 'Verdadero' : 'Falso'}
                </Text>
              </View>
            )}

            {/* Toggle para respuesta correcta */}
            <TouchableOpacity 
              style={styles.toggleCorrectaContainer}
              onPress={() => {
                if (respuestaEditando) {
                  seleccionarRespuestaCorrecta(respuestaEditando.index);
                }
              }}
            >
              <View style={[
                styles.toggleCorrecta,
                respuestaEditando && (
                  tipoPregunta === 'seleccion_multiple' 
                    ? respuestasCorrectas.includes(respuestaEditando.index)
                    : respuestaCorrecta === respuestaEditando.index
                ) && styles.toggleCorrectaActivo
              ]}>
                {respuestaEditando && (
                  tipoPregunta === 'seleccion_multiple' 
                    ? respuestasCorrectas.includes(respuestaEditando.index)
                    : respuestaCorrecta === respuestaEditando.index
                ) && (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </View>
              <Text style={styles.toggleCorrectaTexto}>
                {respuestaEditando && (
                  tipoPregunta === 'seleccion_multiple' 
                    ? respuestasCorrectas.includes(respuestaEditando.index)
                    : respuestaCorrecta === respuestaEditando.index
                ) 
                  ? 'Respuesta correcta ✓' 
                  : 'Marcar como correcta'}
              </Text>
            </TouchableOpacity>

            {/* Botones de acción */}
            <View style={styles.modalRespuestaBotones}>
              <TouchableOpacity 
                style={styles.modalRespuestaBotonCancelar}
                onPress={() => {
                  setMostrarModalRespuesta(false);
                  setRespuestaEditando(null);
                }}
              >
                <Text style={styles.modalRespuestaBotonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalRespuestaBotonGuardar}
                onPress={guardarRespuestaEditada}
              >
                <Text style={styles.modalRespuestaBotonGuardarTexto}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_FONDO,
  },
  scrollView: {
    flex: 1,
  },
  // Header Kahoot style (claro)
  headerKahoot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tipoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  tipoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  listoButton: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  listoTexto: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  // Wrapper multimedia + tiempo
  multimediaWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    position: 'relative',
  },
  // Área multimedia Kahoot (claro)
  multimediaArea: {
    height: 140,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  multimediaTexto: {
    fontSize: 14,
    color: '#666',
  },
  // Imagen seleccionada
  imagenContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagenPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  botonEliminarImagen: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  // Burbuja de tiempo - posicionada en el borde inferior del multimedia
  tiempoBubble: {
    position: 'absolute',
    left: 12,
    bottom: -16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR_TIEMPO,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    zIndex: 10,
  },
  tiempoTexto: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  // Pregunta Kahoot style (claro)
  preguntaContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 20,
    minHeight: 80,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  preguntaInput: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  contadorCaracteres: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  respuestaContador: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  // Respuestas grid Kahoot
  respuestasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  respuestaCard: {
    width: '48%',
    aspectRatio: 1.6,
    borderRadius: 4,
    padding: 12,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  figuraFondo: {
    position: 'absolute',
    opacity: 0.6,
  },
  respuestaTextoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  respuestaTexto: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  respuestaPlaceholder: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Añadir más respuestas
  addPreguntaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  addPreguntaTexto: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  // Menú de opciones
  menuContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  menuTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuOptionText: {
    fontSize: 16,
    color: '#333',
  },
  menuCloseButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  // Estilos para Verdadero/Falso (2 columnas)
  respuestasGrid2Col: {
    justifyContent: 'center',
  },
  respuestaCardVF: {
    width: '48%',
  },
  respuestaCardCorrecta: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  checkCorrecta: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkCorrectaVF: {
    top: 'auto',
    bottom: 12,
    right: 'auto',
    left: '50%',
    marginLeft: -40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  textoCorrectaVF: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonEliminarRespuesta: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
  },
  // Estilos para Completación
  completacionContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  completacionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  completacionInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  respuestaContadorCompletacion: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
  // Nav bar inferior Kahoot (claro)
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1368CE',
  },
  navButtonDisabled: {
    opacity: 0.3,
    borderColor: '#ccc',
  },
  preguntasList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  preguntaMiniatura: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  preguntaMiniaturaActiva: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    transform: [{ scale: 1.1 }],
  },
  preguntaMiniaturaConContenido: {
    backgroundColor: '#e8e8e8',
    borderColor: '#bbb',
  },
  preguntaMiniaturaNumero: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  preguntaMiniaturaNumeroActivo: {
    color: '#fff',
  },
  miniaturaImagenIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 2,
  },
  // Modals (claro)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  tipoOptionSelected: {
    backgroundColor: `${Colors.primary}15`,
  },
  tipoOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  tipoOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  // Grid de tiempo
  tiempoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  tiempoOption: {
    width: '28%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  tiempoOptionSelected: {
    backgroundColor: COLOR_TIEMPO,
  },
  tiempoOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tiempoOptionTextSelected: {
    color: '#fff',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
  modalGuardadoContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  modalGuardadoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  modalGuardadoSubtitulo: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  // Modal de edición de respuesta
  modalRespuestaContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalRespuestaInput: {
    fontSize: 18,
    color: '#333',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 16,
  },
  modalRespuestaContador: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 16,
  },
  toggleCorrectaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  toggleCorrecta: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCorrectaActivo: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  toggleCorrectaTexto: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalRespuestaBotones: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalRespuestaBotonCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalRespuestaBotonCancelarTexto: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalRespuestaBotonGuardar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalRespuestaBotonGuardarTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  modalRespuestaTextoFijo: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  modalRespuestaTextoFijoLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  // Modal de configuración final
  modalConfiguracionContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalConfiguracionTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalConfiguracionSubtitulo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  portadaSelector: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 20,
  },
  portadaPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  portadaPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  portadaPlaceholderText: {
    fontSize: 14,
    color: '#999',
  },
  portadaEditBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  configuracionField: {
    marginBottom: 20,
  },
  configuracionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  configuracionInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
  },
  configuracionContador: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  materiaSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
  },
  materiaTexto: {
    fontSize: 16,
    color: '#333',
  },
  materiaPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  modalConfiguracionBotones: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalConfigBotonCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalConfigBotonCancelarTexto: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalConfigBotonGuardar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalConfigBotonGuardarDisabled: {
    backgroundColor: '#ccc',
  },
  modalConfigBotonGuardarTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Selector de materia
  selectorMateriaContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  materiasLista: {
    maxHeight: 300,
    marginVertical: 12,
  },
  materiaOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 6,
  },
  materiaOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  materiaOptionText: {
    fontSize: 16,
    color: '#333',
  },
  materiaOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
